#!/usr/bin/env python3
"""
ACU Apex Holistic GPA Scoring System - Score Validator

This module provides validation and integrity checking for the scoring system.
It ensures data quality, identifies anomalies, and validates that calculations
meet business requirements and educational standards.

Features:
- Data integrity validation
- Score distribution analysis
- Business rule compliance checking
- Anomaly detection
- Performance monitoring

Author: ACU Apex Development Team
Date: 2024
"""

import asyncio
from datetime import datetime, date
from typing import List, Dict, Optional, Any, Tuple
import logging

import pandas as pd
import numpy as np
from supabase import Client

logger = logging.getLogger(__name__)


class ScoreValidator:
    """
    Validates scoring system data integrity and business rule compliance.
    
    This class provides comprehensive validation of the holistic GPA scoring
    system, ensuring data quality and identifying potential issues that could
    affect the fairness or accuracy of student assessments.
    """
    
    # Validation thresholds
    MIN_HOLISTIC_GPA = 0.0
    MAX_HOLISTIC_GPA = 4.0
    TARGET_MEAN_GPA = 3.0
    ACCEPTABLE_MEAN_RANGE = (2.8, 3.2)
    ACCEPTABLE_STD_RANGE = (0.4, 0.8)
    MIN_STUDENTS_FOR_VALIDATION = 10
    
    # Expected distribution percentages
    EXPECTED_DISTRIBUTION = {
        'below_2_0': 0.05,      # 5% below 2.0
        'between_2_0_2_5': 0.15, # 15% between 2.0-2.5
        'between_2_5_3_5': 0.60, # 60% between 2.5-3.5 (majority)
        'between_3_5_4_0': 0.20  # 20% between 3.5-4.0
    }
    
    def __init__(self, supabase_client: Client):
        """
        Initialize the validator with Supabase client.
        
        Args:
            supabase_client: Authenticated Supabase client
        """
        self.supabase = supabase_client
        logger.info("ScoreValidator initialized")
    
    async def validate_daily_calculation(
        self, 
        academic_year: int,
        calculation_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive validation of a daily calculation.
        
        Args:
            academic_year: Academic year to validate
            calculation_date: Date of calculation (defaults to today)
            
        Returns:
            Dictionary with complete validation results
        """
        if calculation_date is None:
            calculation_date = date.today()
        
        logger.info(f"Starting validation for academic year {academic_year}, date {calculation_date}")
        
        validation_results = {
            'academic_year': academic_year,
            'calculation_date': calculation_date.isoformat(),
            'timestamp': datetime.now().isoformat(),
            'overall_status': 'pending',
            'validations': {}
        }
        
        try:
            # 1. Data Completeness Validation
            completeness_result = await self._validate_data_completeness(academic_year, calculation_date)
            validation_results['validations']['data_completeness'] = completeness_result
            
            # 2. Score Range Validation
            range_result = await self._validate_score_ranges(academic_year, calculation_date)
            validation_results['validations']['score_ranges'] = range_result
            
            # 3. Distribution Validation
            distribution_result = await self._validate_score_distribution(academic_year, calculation_date)
            validation_results['validations']['distribution'] = distribution_result
            
            # 4. Business Rules Validation
            business_rules_result = await self._validate_business_rules(academic_year, calculation_date)
            validation_results['validations']['business_rules'] = business_rules_result
            
            # 5. Consistency Validation
            consistency_result = await self._validate_calculation_consistency(academic_year, calculation_date)
            validation_results['validations']['consistency'] = consistency_result
            
            # 6. Anomaly Detection
            anomaly_result = await self._detect_anomalies(academic_year, calculation_date)
            validation_results['validations']['anomalies'] = anomaly_result
            
            # Determine overall status
            all_validations = validation_results['validations'].values()
            if all(v.get('status') == 'pass' for v in all_validations):
                validation_results['overall_status'] = 'pass'
            elif any(v.get('status') == 'fail' for v in all_validations):
                validation_results['overall_status'] = 'fail'
            else:
                validation_results['overall_status'] = 'warning'
            
            logger.info(f"Validation completed with status: {validation_results['overall_status']}")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error during validation: {str(e)}")
            validation_results['overall_status'] = 'error'
            validation_results['error'] = str(e)
            return validation_results
    
    async def _validate_data_completeness(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Validate that all expected data is present."""
        logger.debug("Validating data completeness")
        
        # Get total students
        students_response = self.supabase.table('students').select('id').eq(
            'academic_year_start', academic_year
        ).execute()
        total_students = len(students_response.data) if students_response.data else 0
        
        # Get students with subcategory scores
        subcategory_scores_response = self.supabase.table('student_subcategory_scores').select(
            'student_id'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        students_with_subcategory_scores = len(set(
            score['student_id'] for score in subcategory_scores_response.data
        )) if subcategory_scores_response.data else 0
        
        # Get students with category scores
        category_scores_response = self.supabase.table('student_category_scores').select(
            'student_id'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        students_with_category_scores = len(set(
            score['student_id'] for score in category_scores_response.data
        )) if category_scores_response.data else 0
        
        # Get students with holistic GPA
        holistic_gpa_response = self.supabase.table('student_holistic_gpa').select(
            'student_id'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        students_with_holistic_gpa = len(holistic_gpa_response.data) if holistic_gpa_response.data else 0
        
        # Calculate completeness percentages
        subcategory_completeness = (students_with_subcategory_scores / total_students * 100) if total_students > 0 else 0
        category_completeness = (students_with_category_scores / total_students * 100) if total_students > 0 else 0
        holistic_completeness = (students_with_holistic_gpa / total_students * 100) if total_students > 0 else 0
        
        # Determine status
        status = 'pass' if all(
            completeness >= 95 for completeness in [subcategory_completeness, category_completeness, holistic_completeness]
        ) else 'fail'
        
        return {
            'status': status,
            'total_students': total_students,
            'students_with_subcategory_scores': students_with_subcategory_scores,
            'students_with_category_scores': students_with_category_scores,
            'students_with_holistic_gpa': students_with_holistic_gpa,
            'subcategory_completeness_percentage': round(subcategory_completeness, 2),
            'category_completeness_percentage': round(category_completeness, 2),
            'holistic_completeness_percentage': round(holistic_completeness, 2)
        }
    
    async def _validate_score_ranges(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Validate that all scores are within expected ranges."""
        logger.debug("Validating score ranges")
        
        # Get all holistic GPAs
        gpa_response = self.supabase.table('student_holistic_gpa').select(
            'holistic_gpa'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        
        if not gpa_response.data:
            return {
                'status': 'fail',
                'message': 'No holistic GPA scores found',
                'invalid_scores': 0,
                'total_scores': 0
            }
        
        gpas = [score['holistic_gpa'] for score in gpa_response.data]
        
        # Check for scores outside valid range
        invalid_scores = [
            gpa for gpa in gpas 
            if gpa < self.MIN_HOLISTIC_GPA or gpa > self.MAX_HOLISTIC_GPA
        ]
        
        status = 'pass' if len(invalid_scores) == 0 else 'fail'
        
        return {
            'status': status,
            'invalid_scores': len(invalid_scores),
            'total_scores': len(gpas),
            'min_score': min(gpas) if gpas else 0,
            'max_score': max(gpas) if gpas else 0,
            'invalid_score_examples': invalid_scores[:5]  # Show first 5 invalid scores
        }
    
    async def _validate_score_distribution(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Validate that score distribution matches expected bell curve."""
        logger.debug("Validating score distribution")
        
        # Get all holistic GPAs
        gpa_response = self.supabase.table('student_holistic_gpa').select(
            'holistic_gpa'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        
        if not gpa_response.data:
            return {
                'status': 'fail',
                'message': 'No holistic GPA scores found for distribution analysis'
            }
        
        gpas = [score['holistic_gpa'] for score in gpa_response.data]
        
        if len(gpas) < self.MIN_STUDENTS_FOR_VALIDATION:
            return {
                'status': 'warning',
                'message': f'Too few students ({len(gpas)}) for meaningful distribution analysis',
                'student_count': len(gpas)
            }
        
        # Calculate distribution statistics
        mean_gpa = np.mean(gpas)
        std_gpa = np.std(gpas)
        
        # Calculate distribution buckets
        below_2_0 = sum(1 for gpa in gpas if gpa < 2.0) / len(gpas)
        between_2_0_2_5 = sum(1 for gpa in gpas if 2.0 <= gpa < 2.5) / len(gpas)
        between_2_5_3_5 = sum(1 for gpa in gpas if 2.5 <= gpa <= 3.5) / len(gpas)
        between_3_5_4_0 = sum(1 for gpa in gpas if 3.5 < gpa <= 4.0) / len(gpas)
        
        # Validate mean and standard deviation
        mean_valid = self.ACCEPTABLE_MEAN_RANGE[0] <= mean_gpa <= self.ACCEPTABLE_MEAN_RANGE[1]
        std_valid = self.ACCEPTABLE_STD_RANGE[0] <= std_gpa <= self.ACCEPTABLE_STD_RANGE[1]
        
        # Validate distribution shape (allow 10% tolerance)
        distribution_valid = (
            abs(between_2_5_3_5 - self.EXPECTED_DISTRIBUTION['between_2_5_3_5']) <= 0.1
        )
        
        status = 'pass' if mean_valid and std_valid and distribution_valid else 'warning'
        
        return {
            'status': status,
            'student_count': len(gpas),
            'mean_gpa': round(mean_gpa, 3),
            'std_gpa': round(std_gpa, 3),
            'mean_valid': mean_valid,
            'std_valid': std_valid,
            'distribution_valid': distribution_valid,
            'actual_distribution': {
                'below_2_0': round(below_2_0, 3),
                'between_2_0_2_5': round(between_2_0_2_5, 3),
                'between_2_5_3_5': round(between_2_5_3_5, 3),
                'between_3_5_4_0': round(between_3_5_4_0, 3)
            },
            'expected_distribution': self.EXPECTED_DISTRIBUTION
        }
    
    async def _validate_business_rules(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Validate business rule compliance."""
        logger.debug("Validating business rules")
        
        violations = []
        
        # Check community service cap (should not exceed 12 hours)
        community_service_response = self.supabase.table('student_subcategory_scores').select(
            'student_id, raw_points'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        
        if community_service_response.data:
            # TODO: Add logic to identify community service subcategory and check cap
            # For now, we'll assume any raw_points > 12 might be a violation
            high_raw_scores = [
                score for score in community_service_response.data 
                if score['raw_points'] > 100  # Placeholder threshold
            ]
            
            if high_raw_scores:
                violations.append({
                    'rule': 'Unusually high raw scores detected',
                    'count': len(high_raw_scores),
                    'examples': high_raw_scores[:3]
                })
        
        # Check for negative scores
        negative_scores = [
            score for score in community_service_response.data 
            if score['raw_points'] < 0
        ] if community_service_response.data else []
        
        if negative_scores:
            violations.append({
                'rule': 'Negative raw scores found',
                'count': len(negative_scores),
                'examples': negative_scores[:3]
            })
        
        status = 'pass' if len(violations) == 0 else 'fail'
        
        return {
            'status': status,
            'violations': violations,
            'violations_count': len(violations)
        }
    
    async def _validate_calculation_consistency(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Validate that calculations are internally consistent."""
        logger.debug("Validating calculation consistency")
        
        inconsistencies = []
        
        # Sample a few students to check consistency
        students_response = self.supabase.table('students').select('id').eq(
            'academic_year_start', academic_year
        ).limit(10).execute()
        
        if not students_response.data:
            return {
                'status': 'warning',
                'message': 'No students found for consistency check'
            }
        
        for student in students_response.data:
            student_id = student['id']
            
            # Get category scores for this student
            category_response = self.supabase.table('student_category_scores').select(
                'normalized_score'
            ).eq('student_id', student_id).eq(
                'academic_year_start', academic_year
            ).eq('calculation_date', calculation_date.isoformat()).execute()
            
            # Get holistic GPA for this student
            holistic_response = self.supabase.table('student_holistic_gpa').select(
                'holistic_gpa'
            ).eq('student_id', student_id).eq(
                'academic_year_start', academic_year
            ).eq('calculation_date', calculation_date.isoformat()).execute()
            
            if category_response.data and holistic_response.data:
                category_scores = [score['normalized_score'] for score in category_response.data]
                calculated_average = sum(category_scores) / len(category_scores)
                actual_holistic_gpa = holistic_response.data[0]['holistic_gpa']
                
                # Check if they match (within small tolerance)
                if abs(calculated_average - actual_holistic_gpa) > 0.01:
                    inconsistencies.append({
                        'student_id': student_id,
                        'calculated_average': round(calculated_average, 3),
                        'actual_holistic_gpa': round(actual_holistic_gpa, 3),
                        'difference': round(abs(calculated_average - actual_holistic_gpa), 3)
                    })
        
        status = 'pass' if len(inconsistencies) == 0 else 'fail'
        
        return {
            'status': status,
            'inconsistencies': inconsistencies,
            'inconsistencies_count': len(inconsistencies),
            'students_checked': len(students_response.data)
        }
    
    async def _detect_anomalies(
        self, 
        academic_year: int, 
        calculation_date: date
    ) -> Dict[str, Any]:
        """Detect statistical anomalies in the data."""
        logger.debug("Detecting anomalies")
        
        anomalies = []
        
        # Get all holistic GPAs
        gpa_response = self.supabase.table('student_holistic_gpa').select(
            'student_id, holistic_gpa'
        ).eq('academic_year_start', academic_year).eq(
            'calculation_date', calculation_date.isoformat()
        ).execute()
        
        if not gpa_response.data:
            return {
                'status': 'warning',
                'message': 'No data available for anomaly detection'
            }
        
        gpas = [score['holistic_gpa'] for score in gpa_response.data]
        
        if len(gpas) >= self.MIN_STUDENTS_FOR_VALIDATION:
            # Statistical outlier detection using z-score
            mean_gpa = np.mean(gpas)
            std_gpa = np.std(gpas)
            
            if std_gpa > 0:  # Avoid division by zero
                for score_data in gpa_response.data:
                    gpa = score_data['holistic_gpa']
                    z_score = abs(gpa - mean_gpa) / std_gpa
                    
                    # Flag as anomaly if z-score > 3 (very rare in normal distribution)
                    if z_score > 3:
                        anomalies.append({
                            'student_id': score_data['student_id'],
                            'holistic_gpa': gpa,
                            'z_score': round(z_score, 2),
                            'type': 'statistical_outlier'
                        })
        
        # Check for students with perfect 4.0 GPAs (unusual in bell curve)
        perfect_scores = [
            score for score in gpa_response.data 
            if score['holistic_gpa'] >= 3.99
        ]
        
        if len(perfect_scores) > len(gpas) * 0.01:  # More than 1% with perfect scores
            anomalies.append({
                'type': 'too_many_perfect_scores',
                'count': len(perfect_scores),
                'percentage': round(len(perfect_scores) / len(gpas) * 100, 2)
            })
        
        status = 'pass' if len(anomalies) == 0 else 'warning'
        
        return {
            'status': status,
            'anomalies': anomalies,
            'anomalies_count': len(anomalies)
        }
    
    async def generate_validation_report(
        self, 
        validation_results: Dict[str, Any]
    ) -> str:
        """Generate a human-readable validation report."""
        report_lines = []
        report_lines.append("="*60)
        report_lines.append("ACU APEX SCORING SYSTEM VALIDATION REPORT")
        report_lines.append("="*60)
        report_lines.append(f"Academic Year: {validation_results['academic_year']}")
        report_lines.append(f"Calculation Date: {validation_results['calculation_date']}")
        report_lines.append(f"Validation Time: {validation_results['timestamp']}")
        report_lines.append(f"Overall Status: {validation_results['overall_status'].upper()}")
        report_lines.append("")
        
        for validation_name, validation_data in validation_results['validations'].items():
            status = validation_data.get('status', 'unknown').upper()
            report_lines.append(f"{validation_name.replace('_', ' ').title()}: {status}")
            
            # Add specific details based on validation type
            if validation_name == 'data_completeness':
                report_lines.append(f"  - Total Students: {validation_data.get('total_students', 0)}")
                report_lines.append(f"  - Holistic GPA Completeness: {validation_data.get('holistic_completeness_percentage', 0):.1f}%")
            
            elif validation_name == 'distribution':
                if 'mean_gpa' in validation_data:
                    report_lines.append(f"  - Mean GPA: {validation_data['mean_gpa']:.2f}")
                    report_lines.append(f"  - Standard Deviation: {validation_data['std_gpa']:.2f}")
                    report_lines.append(f"  - Students in 2.5-3.5 range: {validation_data['actual_distribution']['between_2_5_3_5']:.1%}")
            
            elif validation_name == 'anomalies':
                anomaly_count = validation_data.get('anomalies_count', 0)
                if anomaly_count > 0:
                    report_lines.append(f"  - Anomalies Detected: {anomaly_count}")
            
            report_lines.append("")
        
        report_lines.append("="*60)
        
        return "\n".join(report_lines)


# Example usage
if __name__ == "__main__":
    print("ScoreValidator - This module should be imported and used with a Supabase client")
