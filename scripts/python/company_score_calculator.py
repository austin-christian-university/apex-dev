#!/usr/bin/env python3
"""
ACU Apex Holistic GPA Scoring System - Company Score Calculator

This module handles the calculation of company scores including:
- Company subcategory scores (average of student subcategory scores within the company)
- Company category scores (average of company subcategory scores within the category)
- Company holistic GPA (average of company category scores)

Author: ACU Apex Development Team
Date: 2024
"""

import asyncio
import logging
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
import pandas as pd
import numpy as np
from supabase import Client

logger = logging.getLogger(__name__)


class CompanyScoreCalculator:
    """
    Handles all company score calculations for the ACU Apex scoring system.
    
    This class calculates:
    1. Company subcategory scores (averages of student subcategory scores)
    2. Company category scores (averages of company subcategory scores)
    3. Company holistic GPAs (averages of company category scores)
    """
    
    def __init__(self, supabase: Client):
        """Initialize the calculator with Supabase client."""
        self.supabase = supabase
        
    async def calculate_all_company_scores(
        self, 
        academic_year: int, 
        calculation_date: Optional[date] = None
    ) -> Dict[str, any]:
        """
        Calculate all company scores for a given academic year and date.
        
        Args:
            academic_year: Academic year to process
            calculation_date: Date for calculation (defaults to today)
            
        Returns:
            Dictionary with calculation results and statistics
        """
        if calculation_date is None:
            calculation_date = date.today()
            
        logger.info(f"Starting company score calculation for academic year {academic_year}")
        logger.info(f"Calculation date: {calculation_date}")
        
        start_time = datetime.now()
        results = {
            'academic_year': academic_year,
            'calculation_date': calculation_date.isoformat(),
            'companies_processed': 0,
            'total_companies': 0,
            'phases': [],
            'total_execution_time': None,
            'status': 'in_progress'
        }
        
        try:
            # Get all active companies
            companies_response = await self.supabase.table('companies').select('id, name').eq('is_active', True).execute()
            companies = companies_response.data
            
            if not companies:
                logger.warning("No active companies found")
                return {'companies_processed': 0, 'error': 'No active companies found'}
            
            results['total_companies'] = len(companies)
            companies_processed = 0
            
            # Phase 1: Calculate company subcategory scores
            phase_start = datetime.now()
            subcategory_results = await self._calculate_all_company_subcategory_scores(
                companies, academic_year, calculation_date
            )
            phase_time = (datetime.now() - phase_start).total_seconds()
            results['phases'].append({
                'phase': 'Calculate Company Subcategory Scores',
                'companies_processed': subcategory_results['companies_processed'],
                'subcategories_processed': subcategory_results['subcategories_processed'],
                'execution_time_seconds': phase_time,
                'status': 'completed'
            })
            
            # Phase 2: Calculate company category scores
            phase_start = datetime.now()
            category_results = await self._calculate_all_company_category_scores(
                companies, academic_year, calculation_date
            )
            phase_time = (datetime.now() - phase_start).total_seconds()
            results['phases'].append({
                'phase': 'Calculate Company Category Scores',
                'companies_processed': category_results['companies_processed'],
                'categories_processed': category_results['categories_processed'],
                'execution_time_seconds': phase_time,
                'status': 'completed'
            })
            
            # Phase 3: Calculate company holistic GPAs
            phase_start = datetime.now()
            gpa_results = await self._calculate_all_company_holistic_gpas(
                companies, academic_year, calculation_date
            )
            phase_time = (datetime.now() - phase_start).total_seconds()
            results['phases'].append({
                'phase': 'Calculate Company Holistic GPAs',
                'companies_processed': gpa_results['companies_processed'],
                'execution_time_seconds': phase_time,
                'status': 'completed'
            })
            
            # Calculate total execution time
            total_time = (datetime.now() - start_time).total_seconds()
            results['total_execution_time'] = total_time
            results['status'] = 'completed'
            results['companies_processed'] = len(companies)
            
            logger.info(f"Company score calculation completed successfully in {total_time:.2f} seconds")
            logger.info(f"Processed {len(companies)} companies across {len(results['phases'])} phases")
            
            return results
            
        except Exception as e:
            logger.error(f"Error during company score calculation: {str(e)}")
            results['status'] = 'error'
            results['error'] = str(e)
            results['total_execution_time'] = (datetime.now() - start_time).total_seconds()
            raise
    
    async def _calculate_all_company_subcategory_scores(
        self, 
        companies: List[Dict], 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate subcategory scores for all companies.
        
        Args:
            companies: List of company dictionaries
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company subcategory scores for {len(companies)} companies")
        
        companies_processed = 0
        subcategories_processed = 0
        
        for company in companies:
            try:
                # Use the PostgreSQL function to calculate company subcategory scores
                response = await self.supabase.rpc(
                    'calculate_company_subcategory_scores',
                    {
                        'p_company_id': company['id'],
                        'p_academic_year_start': academic_year,
                        'p_calculation_date': calculation_date.isoformat()
                    }
                ).execute()
                
                companies_processed += 1
                logger.info(f"Calculated subcategory scores for company: {company['name']}")
                
                # Count subcategories processed (assuming all subcategories were processed)
                subcategories_response = await self.supabase.table('subcategories').select('id').execute()
                subcategories_processed += len(subcategories_response.data)
                
            except Exception as e:
                logger.error(f"Error calculating subcategory scores for company {company['name']}: {str(e)}")
                continue
        
        return {
            'companies_processed': companies_processed,
            'subcategories_processed': subcategories_processed
        }
    
    async def _calculate_all_company_category_scores(
        self, 
        companies: List[Dict], 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate category scores for all companies.
        
        Args:
            companies: List of company dictionaries
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company category scores for {len(companies)} companies")
        
        companies_processed = 0
        categories_processed = 0
        
        for company in companies:
            try:
                # Use the PostgreSQL function to calculate company category scores
                response = await self.supabase.rpc(
                    'calculate_company_category_scores',
                    {
                        'p_company_id': company['id'],
                        'p_academic_year_start': academic_year,
                        'p_calculation_date': calculation_date.isoformat()
                    }
                ).execute()
                
                companies_processed += 1
                logger.info(f"Calculated category scores for company: {company['name']}")
                
                # Count categories processed (assuming all categories were processed)
                categories_response = await self.supabase.table('categories').select('id').execute()
                categories_processed += len(categories_response.data)
                
            except Exception as e:
                logger.error(f"Error calculating category scores for company {company['name']}: {str(e)}")
                continue
        
        return {
            'companies_processed': companies_processed,
            'categories_processed': categories_processed
        }
    
    async def _calculate_all_company_holistic_gpas(
        self, 
        companies: List[Dict], 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate holistic GPAs for all companies.
        
        Args:
            companies: List of company dictionaries
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company holistic GPAs for {len(companies)} companies")
        
        companies_processed = 0
        
        for company in companies:
            try:
                # Use the PostgreSQL function to calculate company holistic GPA
                response = await self.supabase.rpc(
                    'calculate_company_holistic_gpa',
                    {
                        'p_company_id': company['id'],
                        'p_academic_year_start': academic_year,
                        'p_calculation_date': calculation_date.isoformat()
                    }
                ).execute()
                
                companies_processed += 1
                logger.info(f"Calculated holistic GPA for company: {company['name']}")
                
            except Exception as e:
                logger.error(f"Error calculating holistic GPA for company {company['name']}: {str(e)}")
                continue
        
        return {
            'companies_processed': companies_processed
        }
    
    async def get_company_rankings(
        self, 
        academic_year: int, 
        calculation_date: Optional[date] = None
    ) -> List[Dict]:
        """
        Get company rankings based on holistic GPAs.
        
        Args:
            academic_year: Academic year to process
            calculation_date: Date for calculation (defaults to today)
            
        Returns:
            List of company rankings ordered by holistic GPA
        """
        if calculation_date is None:
            calculation_date = date.today()
            
        try:
            # Get company holistic GPAs ordered by score
            response = await self.supabase.table('company_holistic_gpa').select(
                'company_id, holistic_gpa, category_breakdown, calculation_date'
            ).eq('academic_year_start', academic_year).eq(
                'calculation_date', calculation_date.isoformat()
            ).order('holistic_gpa', desc=True).execute()
            
            rankings = []
            for i, record in enumerate(response.data, 1):
                # Get company name
                company_response = await self.supabase.table('companies').select('name').eq('id', record['company_id']).execute()
                company_name = company_response.data[0]['name'] if company_response.data else 'Unknown Company'
                
                rankings.append({
                    'rank': i,
                    'company_id': record['company_id'],
                    'company_name': company_name,
                    'holistic_gpa': float(record['holistic_gpa']),
                    'category_breakdown': record['category_breakdown'],
                    'calculation_date': record['calculation_date']
                })
            
            logger.info(f"Retrieved rankings for {len(rankings)} companies")
            return rankings
            
        except Exception as e:
            logger.error(f"Error getting company rankings: {str(e)}")
            return []
    
    async def validate_company_scores(
        self, 
        academic_year: int, 
        calculation_date: Optional[date] = None
    ) -> Dict:
        """
        Validate company scores for data integrity.
        
        Args:
            academic_year: Academic year to process
            calculation_date: Date for calculation (defaults to today)
            
        Returns:
            Dictionary with validation results
        """
        if calculation_date is None:
            calculation_date = date.today()
            
        validation_results = {
            'academic_year': academic_year,
            'calculation_date': calculation_date.isoformat(),
            'validation_checks': [],
            'status': 'passed'
        }
        
        try:
            # Check 1: All companies have holistic GPAs
            companies_response = await self.supabase.table('companies').select('id, name').eq('is_active', True).execute()
            companies = companies_response.data
            
            holistic_gpas_response = await self.supabase.table('company_holistic_gpa').select('company_id').eq(
                'academic_year_start', academic_year
            ).eq('calculation_date', calculation_date.isoformat()).execute()
            
            companies_with_gpas = {gpa['company_id'] for gpa in holistic_gpas_response.data}
            missing_gpas = [c['name'] for c in companies if c['id'] not in companies_with_gpas]
            
            if missing_gpas:
                validation_results['validation_checks'].append({
                    'check': 'All companies have holistic GPAs',
                    'status': 'failed',
                    'details': f"Missing GPAs for companies: {missing_gpas}"
                })
                validation_results['status'] = 'failed'
            else:
                validation_results['validation_checks'].append({
                    'check': 'All companies have holistic GPAs',
                    'status': 'passed',
                    'details': f"All {len(companies)} companies have holistic GPAs"
                })
            
            # Check 2: Holistic GPAs are within valid range (0.0-4.0)
            invalid_gpas = []
            for gpa_record in holistic_gpas_response.data:
                gpa_value = float(gpa_record.get('holistic_gpa', 0))
                if not (0.0 <= gpa_value <= 4.0):
                    invalid_gpas.append(gpa_record['company_id'])
            
            if invalid_gpas:
                validation_results['validation_checks'].append({
                    'check': 'Holistic GPAs are within valid range (0.0-4.0)',
                    'status': 'failed',
                    'details': f"Invalid GPAs for companies: {invalid_gpas}"
                })
                validation_results['status'] = 'failed'
            else:
                validation_results['validation_checks'].append({
                    'check': 'Holistic GPAs are within valid range (0.0-4.0)',
                    'status': 'passed',
                    'details': f"All {len(holistic_gpas_response.data)} GPAs are within valid range"
                })
            
            logger.info(f"Company score validation completed with status: {validation_results['status']}")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error validating company scores: {str(e)}")
            validation_results['status'] = 'error'
            validation_results['error'] = str(e)
            return validation_results


# Example usage
async def main():
    """Example usage of the CompanyScoreCalculator."""
    import os
    from dotenv import load_dotenv
    from supabase import create_client
    
    # Load environment variables
    load_dotenv()
    
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    
    supabase = create_client(supabase_url, supabase_key)
    
    # Initialize calculator
    calculator = CompanyScoreCalculator(supabase)
    
    # Calculate all company scores
    results = await calculator.calculate_all_company_scores(2025)
    print(f"Company score calculation results: {results}")
    
    # Get company rankings
    rankings = await calculator.get_company_rankings(2025)
    print(f"Company rankings: {rankings}")
    
    # Validate company scores
    validation = await calculator.validate_company_scores(2025)
    print(f"Validation results: {validation}")


if __name__ == "__main__":
    asyncio.run(main())
