#!/usr/bin/env python3
"""
ACU Blueprint Holistic GPA Scoring System - Daily Score Calculation Script

This script orchestrates the daily calculation of holistic GPAs for all students.
It processes event submissions, applies business rules, and updates the database
with normalized scores using a bell curve distribution.

Usage:
    python scripts/daily_score_calculation.py [--academic-year YEAR] [--batch-size SIZE] [--dry-run]

Author: ACU Blueprint Development Team
Date: 2024
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
import argparse

import pandas as pd
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv

# Add the scripts directory to the Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from apex_scoring.aggregators import SubcategoryAggregator
from apex_scoring.company_scores import (
    StudentCategoryHolisticCalculator,
    CompanyScoreCalculator,
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DailyScoreCalculator:
    """
    Main orchestrator for daily holistic GPA calculations.
    
    This class coordinates the entire scoring pipeline:
    1. Calculates raw subcategory scores from event submissions
    2. Applies bell curve normalization across student population
    3. Calculates category scores as weighted averages
    4. Computes final holistic GPAs
    5. Updates company standings
    """
    
    def __init__(self, supabase_url: str, supabase_key: str):
        """Initialize the calculator with Supabase client."""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        # Use notebook-exported calculators (no DB RPCs)
        self.subcategory_aggregator = SubcategoryAggregator(self.supabase)
        self.student_calculator = StudentCategoryHolisticCalculator(self.supabase)
        self.company_calculator = CompanyScoreCalculator(self.supabase)
        
    async def run_daily_calculation(
        self, 
        academic_year: Optional[int] = None,
        calculation_date: Optional[date] = None,
        batch_size: int = 50,
        dry_run: bool = False
    ) -> Dict[str, any]:
        """
        Run the complete daily scoring calculation process.
        
        Args:
            academic_year: Academic year to process (defaults to current year)
            calculation_date: Date for calculation (defaults to today)
            batch_size: Number of students to process per batch
            dry_run: If True, don't update database
            
        Returns:
            Dictionary with calculation results and statistics
        """
        # Set defaults
        if academic_year is None:
            academic_year = datetime.now().year
        if calculation_date is None:
            calculation_date = date.today()
            
        logger.info(f"Starting daily score calculation for academic year {academic_year}")
        logger.info(f"Calculation date: {calculation_date}, Batch size: {batch_size}")
        logger.info(f"Dry run mode: {dry_run}")
        
        start_time = datetime.now()
        results = {
            'academic_year': academic_year,
            'calculation_date': calculation_date.isoformat(),
            'batch_size': batch_size,
            'dry_run': dry_run,
            'phases': [],
            'total_execution_time': None,
            'status': 'in_progress'
        }
        
        try:
            # Phase 1: Get all students for this academic year
            students = await self._get_students(academic_year)
            total_students = len(students)
            logger.info(f"Found {total_students} students to process")
            
            # Phase 2: Normalize latest-day subcategory scores (non-GPA via bell curve, GPA = score)
            if not dry_run:
                phase_start = datetime.now()
                norm_result = self.subcategory_aggregator.normalize_all_subcategories_for_latest_day()
                phase_time = (datetime.now() - phase_start).total_seconds()
                results['phases'].append({
                    'phase': 'Normalize Subcategory Scores (latest day)',
                    'subcategories_processed': len(norm_result.get('results', {})),
                    'execution_time_seconds': phase_time,
                    'status': 'completed'
                })

            # Phase 3: Student category scores
            if not dry_run:
                phase_start = datetime.now()
                cat_res = self.student_calculator.compute_student_category_scores_for_day(calculation_date.isoformat())
                phase_time = (datetime.now() - phase_start).total_seconds()
                results['phases'].append({
                    'phase': 'Calculate Student Category Scores',
                    'rows_upserted': cat_res.get('student_category_rows_upserted', 0),
                    'execution_time_seconds': phase_time,
                    'status': 'completed'
                })

            # Phase 4: Student holistic GPAs
            if not dry_run:
                phase_start = datetime.now()
                hol_res = self.student_calculator.compute_student_holistic_gpa_for_day(calculation_date.isoformat())
                phase_time = (datetime.now() - phase_start).total_seconds()
                results['phases'].append({
                    'phase': 'Calculate Student Holistic GPAs',
                    'rows_upserted': hol_res.get('student_holistic_rows_upserted', 0),
                    'execution_time_seconds': phase_time,
                    'status': 'completed'
                })

            # Phase 5: Company scores
            if not dry_run:
                phase_start = datetime.now()
                comp_sub = self.company_calculator.compute_company_subcategory_scores_for_day(calculation_date.isoformat())
                comp_cat = self.company_calculator.compute_company_category_scores_for_day(calculation_date.isoformat())
                comp_hol = self.company_calculator.compute_company_holistic_gpa_for_day(calculation_date.isoformat())
                phase_time = (datetime.now() - phase_start).total_seconds()
                results['phases'].append({
                    'phase': 'Update Company Scores',
                    'subcategory_rows': comp_sub.get('company_subcategory_rows_upserted', 0),
                    'category_rows': comp_cat.get('company_category_rows_upserted', 0),
                    'holistic_rows': comp_hol.get('company_holistic_rows_upserted', 0),
                    'execution_time_seconds': phase_time,
                    'status': 'completed'
                })
            
            # Calculate total execution time
            total_time = (datetime.now() - start_time).total_seconds()
            results['total_execution_time'] = total_time
            results['status'] = 'completed'
            
            logger.info(f"Daily calculation completed successfully in {total_time:.2f} seconds")
            logger.info(f"Processed {total_students} students across {len(results['phases'])} phases")
            
            return results
            
        except Exception as e:
            logger.error(f"Error during daily calculation: {str(e)}")
            results['status'] = 'error'
            results['error'] = str(e)
            results['total_execution_time'] = (datetime.now() - start_time).total_seconds()
            raise
    
    async def _get_students(self, academic_year: int) -> List[Dict]:
        """Get all students for the specified academic year."""
        logger.info(f"Fetching students for academic year {academic_year}")
        
        response = self.supabase.table('students').select('id, company_id, academic_year_start').eq(
            'academic_year_start', academic_year
        ).execute()
        
        if response.data:
            logger.info(f"Found {len(response.data)} students")
            return response.data
        else:
            logger.warning("No students found for academic year")
            return []
    
    async def _calculate_subcategory_scores(
        self, 
        students: List[Dict], 
        academic_year: int, 
        calculation_date: date,
        batch_size: int,
        dry_run: bool
    ) -> Dict:
        """Calculate raw subcategory scores for all students."""
        logger.info("Starting subcategory score calculations")
        
        students_processed = 0
        subcategories_processed = 0
        
        # Process students in batches
        for i in range(0, len(students), batch_size):
            batch = students[i:i + batch_size]
            logger.info(f"Processing student batch {i//batch_size + 1}, students {i+1}-{min(i+batch_size, len(students))}")
            
            # Process each student in the batch
            for student in batch:
                if not dry_run:
                    # Use the database function to calculate subcategory scores
                    response = self.supabase.rpc(
                        'calculate_student_subcategory_scores',
                        {
                            'student_uuid': student['id'],
                            'academic_year_start_param': academic_year,
                            'calculation_date_param': calculation_date.isoformat()
                        }
                    ).execute()
                    
                    if response.data:
                        subcategories_processed += response.data
                
                students_processed += 1
            
            # Log progress
            logger.info(f"Completed batch. Total students processed: {students_processed}/{len(students)}")
        
        return {
            'students_processed': students_processed,
            'subcategories_processed': subcategories_processed
        }
    
    async def _apply_bell_curve_normalization(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """Apply bell curve normalization to all subcategories."""
        logger.info("Starting bell curve normalization")
        
        # Use the database function to apply bell curve to all subcategories
        response = self.supabase.rpc(
            'apply_bell_curve_to_all_subcategories',
            {
                'academic_year_start_param': academic_year,
                'calculation_date_param': calculation_date.isoformat()
            }
        ).execute()
        
        students_processed = 0
        subcategories_processed = 0
        
        if response.data:
            for result in response.data:
                subcategories_processed += 1
                students_processed += result.get('students_processed', 0)
                logger.info(f"Applied bell curve to {result['subcategory_name']}: {result['students_processed']} students")
        
        logger.info(f"Bell curve normalization completed. {subcategories_processed} subcategories, {students_processed} total student scores processed")
        
        return {
            'students_processed': students_processed,
            'subcategories_processed': subcategories_processed
        }
    
    async def _calculate_category_scores(
        self, 
        students: List[Dict], 
        academic_year: int, 
        calculation_date: date,
        batch_size: int
    ) -> Dict:
        """Calculate category scores for all students."""
        logger.info("Starting category score calculations")
        
        students_processed = 0
        
        # Process students in batches
        for i in range(0, len(students), batch_size):
            batch = students[i:i + batch_size]
            
            for student in batch:
                # Use the database function to calculate category scores
                response = self.supabase.rpc(
                    'calculate_student_category_scores',
                    {
                        'student_uuid': student['id'],
                        'academic_year_start_param': academic_year,
                        'calculation_date_param': calculation_date.isoformat()
                    }
                ).execute()
                
                students_processed += 1
            
            logger.info(f"Category scores completed for batch. Total students: {students_processed}/{len(students)}")
        
        return {'students_processed': students_processed}
    
    async def _calculate_holistic_gpas(
        self, 
        students: List[Dict], 
        academic_year: int, 
        calculation_date: date,
        batch_size: int
    ) -> Dict:
        """Calculate holistic GPAs for all students."""
        logger.info("Starting holistic GPA calculations")
        
        students_processed = 0
        
        # Process students in batches
        for i in range(0, len(students), batch_size):
            batch = students[i:i + batch_size]
            
            for student in batch:
                # Use the database function to calculate holistic GPA
                response = self.supabase.rpc(
                    'calculate_student_holistic_gpa',
                    {
                        'student_uuid': student['id'],
                        'academic_year_start_param': academic_year,
                        'calculation_date_param': calculation_date.isoformat()
                    }
                ).execute()
                
                students_processed += 1
            
            logger.info(f"Holistic GPAs completed for batch. Total students: {students_processed}/{len(students)}")
        
        return {'students_processed': students_processed}
    
    async def _update_company_standings(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Update company standings based on student holistic GPAs.
        
        Args:
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with company standings update results
        """
        logger.info(f"Updating company standings for academic year {academic_year}")
        
        try:
            # Get all active companies
            companies_response = await self.supabase.table('companies').select('id, name').eq('is_active', True).execute()
            companies = companies_response.data
            
            if not companies:
                logger.warning("No active companies found")
                return {'companies_processed': 0, 'error': 'No active companies found'}
            
            companies_processed = 0
            
            for company in companies:
                try:
                    # Calculate company subcategory scores
                    await self._calculate_company_subcategory_scores(
                        company['id'], academic_year, calculation_date
                    )
                    
                    # Calculate company category scores
                    await self._calculate_company_category_scores(
                        company['id'], academic_year, calculation_date
                    )
                    
                    # Calculate company holistic GPA
                    await self._calculate_company_holistic_gpa(
                        company['id'], academic_year, calculation_date
                    )
                    
                    companies_processed += 1
                    logger.info(f"Updated standings for company: {company['name']}")
                    
                except Exception as e:
                    logger.error(f"Error updating company {company['name']}: {str(e)}")
                    continue
            
            logger.info(f"Completed company standings update. Processed {companies_processed} companies")
            return {
                'companies_processed': companies_processed,
                'total_companies': len(companies)
            }
            
        except Exception as e:
            logger.error(f"Error updating company standings: {str(e)}")
            return {'error': str(e)}

    async def _calculate_company_subcategory_scores(
        self, 
        company_id: str, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate company subcategory scores (average of student subcategory scores within the company).
        
        Args:
            company_id: Company UUID
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company subcategory scores for company {company_id}")
        
        try:
            # Get all subcategories
            subcategories_response = await self.supabase.table('subcategories').select('id, name').execute()
            subcategories = subcategories_response.data
            
            scores_calculated = 0
            
            for subcategory in subcategories:
                # Get average scores for this subcategory across all students in the company
                avg_scores_response = await self.supabase.rpc(
                    'calculate_company_subcategory_scores',
                    {
                        'p_company_id': company_id,
                        'p_academic_year_start': academic_year,
                        'p_calculation_date': calculation_date.isoformat()
                    }
                ).execute()
                
                scores_calculated += 1
                logger.debug(f"Calculated subcategory score for {subcategory['name']}")
            
            logger.info(f"Completed company subcategory score calculation. Processed {scores_calculated} subcategories")
            return {'subcategories_processed': scores_calculated}
            
        except Exception as e:
            logger.error(f"Error calculating company subcategory scores: {str(e)}")
            return {'error': str(e)}

    async def _calculate_company_category_scores(
        self, 
        company_id: str, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate company category scores (average of company subcategory scores within the category).
        
        Args:
            company_id: Company UUID
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company category scores for company {company_id}")
        
        try:
            # Get all categories
            categories_response = await self.supabase.table('categories').select('id, name').execute()
            categories = categories_response.data
            
            scores_calculated = 0
            
            for category in categories:
                # Calculate category score using the PostgreSQL function
                category_score_response = await self.supabase.rpc(
                    'calculate_company_category_scores',
                    {
                        'p_company_id': company_id,
                        'p_academic_year_start': academic_year,
                        'p_calculation_date': calculation_date.isoformat()
                    }
                ).execute()
                
                scores_calculated += 1
                logger.debug(f"Calculated category score for {category['name']}")
            
            logger.info(f"Completed company category score calculation. Processed {scores_calculated} categories")
            return {'categories_processed': scores_calculated}
            
        except Exception as e:
            logger.error(f"Error calculating company category scores: {str(e)}")
            return {'error': str(e)}

    async def _calculate_company_holistic_gpa(
        self, 
        company_id: str, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict:
        """
        Calculate company holistic GPA (average of company category scores).
        
        Args:
            company_id: Company UUID
            academic_year: Academic year to process
            calculation_date: Date for calculation
            
        Returns:
            Dictionary with calculation results
        """
        logger.info(f"Calculating company holistic GPA for company {company_id}")
        
        try:
            # Calculate holistic GPA using the PostgreSQL function
            holistic_gpa_response = await self.supabase.rpc(
                'calculate_company_holistic_gpa',
                {
                    'p_company_id': company_id,
                    'p_academic_year_start': academic_year,
                    'p_calculation_date': calculation_date.isoformat()
                }
            ).execute()
            
            logger.info(f"Completed company holistic GPA calculation for company {company_id}")
            return {'holistic_gpa_calculated': True}
            
        except Exception as e:
            logger.error(f"Error calculating company holistic GPA: {str(e)}")
            return {'error': str(e)}


async def main():
    """Main entry point for the daily score calculation script."""
    parser = argparse.ArgumentParser(description='ACU Blueprint Daily Score Calculation')
    parser.add_argument('--academic-year', type=int, help='Academic year to process (default: current year)')
    parser.add_argument('--batch-size', type=int, default=50, help='Batch size for processing students (default: 50)')
    parser.add_argument('--dry-run', action='store_true', help='Run without updating database')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Get Supabase credentials from environment
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
        sys.exit(1)
    
    # Initialize calculator
    calculator = DailyScoreCalculator(supabase_url, supabase_key)
    
    try:
        # Run the daily calculation
        results = await calculator.run_daily_calculation(
            academic_year=args.academic_year,
            batch_size=args.batch_size,
            dry_run=args.dry_run
        )
        
        # Print summary
        print("\n" + "="*50)
        print("DAILY SCORE CALCULATION SUMMARY")
        print("="*50)
        print(f"Academic Year: {results['academic_year']}")
        print(f"Calculation Date: {results['calculation_date']}")
        print(f"Total Execution Time: {results['total_execution_time']:.2f} seconds")
        print(f"Status: {results['status'].upper()}")
        print(f"Dry Run: {results['dry_run']}")
        print("\nPhase Results:")
        
        for phase in results['phases']:
            print(f"  {phase['phase']}: {phase.get('students_processed', 0)} students, {phase['execution_time_seconds']:.2f}s")
        
        print("="*50)
        
    except Exception as e:
        logger.error(f"Daily calculation failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

# AWS Lambda handler reusing the same orchestrator
def lambda_handler(event, context):
    """Lambda handler that runs the daily calculation.

    Expected optional event fields: academic_year, calculation_date (YYYY-MM-DD),
    batch_size, dry_run.
    """
    supabase_url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        raise RuntimeError("Missing Supabase credentials in environment")

    evt = event or {}
    if not isinstance(evt, dict):
        evt = {}

    academic_year = int(evt.get('academic_year') or datetime.now().year)
    date_str = evt.get('calculation_date')
    calc_date = date.fromisoformat(date_str) if date_str else date.today()
    batch_size = int(evt.get('batch_size') or 50)
    dry_run = bool(evt.get('dry_run') or False)

    calculator = DailyScoreCalculator(supabase_url, supabase_key)
    result = asyncio.run(
        calculator.run_daily_calculation(
            academic_year=academic_year,
            calculation_date=calc_date,
            batch_size=batch_size,
            dry_run=dry_run,
        )
    )
    return {"statusCode": 200, "body": result}
