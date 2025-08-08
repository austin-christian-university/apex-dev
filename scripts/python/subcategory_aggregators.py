#!/usr/bin/env python3
"""
ACU Apex Holistic GPA Scoring System - Subcategory Aggregators

This module implements the business logic for aggregating raw data from
event submissions into subcategory scores. Each subcategory type has
specific rules and calculations based on the nature of the activity.

Subcategory Types:
- Binary Attendance (chapel, GBE, fellow friday)
- Hours-Based with Caps (community service)
- Staff-Assigned Points (credentials, promotions)
- Performance Ratings (grades, participation)
- Binary Monthly Checks (small group, dream team)
- Points-Based (fellow friday participation)
- Attendance + Bonus (GBE participation)

Author: ACU Apex Development Team
Date: 2024
"""

import asyncio
from datetime import datetime, date
from typing import List, Dict, Optional, Any
import logging

from supabase import Client

logger = logging.getLogger(__name__)


class SubcategoryAggregator:
    """
    Handles aggregation of event submission data into subcategory scores.
    
    This class implements the business logic for each type of subcategory,
    applying appropriate caps, weights, and calculations based on the
    subcategory's data source and scoring methodology.
    """
    
    # Subcategory scoring constants
    COMMUNITY_SERVICE_CAP = 12      # Maximum hours for community service
    DAILY_HOURS_CAP = 8             # Maximum hours per day for any activity
    MAX_RATING_SCALE = 10           # Maximum rating scale (converted to 100)
    
    # Subcategory type mappings
    BINARY_ATTENDANCE_SUBCATEGORIES = {
        'chapel_attendance',
        'fellow_friday_attendance', 
        'gbe_attendance',
        'company_community_events'
    }
    
    STAFF_ASSIGNED_SUBCATEGORIES = {
        'credentials_certifications',
        'job_promotion_opportunities'
    }
    
    BINARY_MONTHLY_CHECK_SUBCATEGORIES = {
        'small_group_involvement',
        'dream_team_involvement'
    }
    
    PERFORMANCE_RATING_SUBCATEGORIES = {
        'chapel_participation',
        'company_team_building'
    }
    
    def __init__(self, supabase_client: Client):
        """
        Initialize the aggregator with Supabase client.
        
        Args:
            supabase_client: Authenticated Supabase client
        """
        self.supabase = supabase_client
        logger.info("SubcategoryAggregator initialized")
    
    async def aggregate_community_service_hours(
        self, 
        student_id: str, 
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate community service hours with 12-hour cap and daily limits.
        
        Business Rules:
        - Daily cap of 8 hours per submission
        - Total cap of 12 hours for the academic year
        - No extra credit for exceeding 12 hours
        
        Args:
            student_id: Student UUID
            academic_year: Academic year to process
            
        Returns:
            Dictionary with aggregated hours and submission details
        """
        logger.debug(f"Aggregating community service for student {student_id}")
        
        # Get all community service submissions for this student
        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).execute()
        
        if not response.data:
            return {
                'total_hours': 0,
                'capped_hours': 0,
                'submission_count': 0,
                'submissions': []
            }
        
        total_hours = 0
        submission_details = []
        
        for submission in response.data:
            # Check if this is a community service submission
            submission_data = submission.get('submission_data', {})
            if submission_data.get('submission_type') != 'community_service':
                continue
            
            # Check if submission is from the correct academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # Get hours and apply daily cap
            hours = float(submission_data.get('hours', 0))
            capped_daily_hours = min(hours, self.DAILY_HOURS_CAP)
            
            total_hours += capped_daily_hours
            submission_details.append({
                'submission_id': submission['id'],
                'date': submitted_date.isoformat(),
                'raw_hours': hours,
                'capped_hours': capped_daily_hours,
                'organization': submission_data.get('organization', ''),
                'description': submission_data.get('description', '')
            })
        
        # Apply total cap of 12 hours
        capped_total_hours = min(total_hours, self.COMMUNITY_SERVICE_CAP)
        
        result = {
            'total_hours': total_hours,
            'capped_hours': capped_total_hours,
            'submission_count': len(submission_details),
            'submissions': submission_details,
            'cap_applied': total_hours > self.COMMUNITY_SERVICE_CAP
        }
        
        logger.debug(f"Community service result: {capped_total_hours} hours (cap applied: {result['cap_applied']})")
        return result
    
    async def _get_subcategory_id_by_name(self, name: str) -> Optional[str]:
        """Resolve a subcategory id by its internal name."""
        resp = self.supabase.table('subcategories').select('id').eq('name', name).limit(1).execute()
        if resp.data:
            return resp.data[0]['id']
        return None

    async def aggregate_attendance_percentage(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate binary attendance for subcategories like chapel, GBE, etc.
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with attendance statistics
        """
        logger.debug(f"Aggregating attendance for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {'attendance_percentage': 0, 'present_count': 0, 'total_count': 0, 'submissions': []}

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        if not response.data:
            return {
                'attendance_percentage': 0,
                'present_count': 0,
                'total_count': 0,
                'submissions': []
            }
        
        present_count = 0
        total_count = 0
        submission_details = []
        
        for submission in response.data:
            submission_data = submission.get('submission_data', {})
            
            # Check if this is an attendance submission for the right subcategory
            if submission_data.get('submission_type') != 'attendance':
                continue
            
            # Check academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # TODO: Add logic to match submission to specific subcategory
            # For now, we'll assume all attendance submissions count
            
            status = submission_data.get('status', 'absent')
            if status == 'present':
                present_count += 1
            
            total_count += 1
            submission_details.append({
                'submission_id': submission['id'],
                'date': submitted_date.isoformat(),
                'status': status
            })
        
        # Calculate attendance percentage
        attendance_percentage = (present_count / total_count * 100) if total_count > 0 else 0
        
        result = {
            'attendance_percentage': round(attendance_percentage, 2),
            'present_count': present_count,
            'total_count': total_count,
            'submissions': submission_details
        }
        
        logger.debug(f"Attendance result for {subcategory_name}: {attendance_percentage:.1f}% ({present_count}/{total_count})")
        return result
    
    async def aggregate_staff_assigned_points(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate staff-assigned points for credentials and promotions.
        
        Business Rules:
        - No default weights - all points assigned by staff
        - Sum all assigned points for the academic year
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with total points and submission details
        """
        logger.debug(f"Aggregating staff points for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {'total_points': 0, 'submission_count': 0, 'submissions': []}

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        if not response.data:
            return {
                'total_points': 0,
                'submission_count': 0,
                'submissions': []
            }
        
        total_points = 0
        submission_details = []
        
        # Determine submission types based on subcategory
        if subcategory_name == 'credentials_certifications':
            target_types = ['credentials']
        elif subcategory_name == 'job_promotion_opportunities':
            target_types = ['job_promotion']
        else:
            target_types = []
        
        for submission in response.data:
            submission_data = submission.get('submission_data', {})
            submission_type = submission_data.get('submission_type', '')
            
            # Check if this submission matches our target types
            if submission_type not in target_types:
                continue
            
            # Check academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # Get staff-assigned points
            assigned_points = float(submission_data.get('assigned_points', 0))
            total_points += assigned_points
            
            submission_details.append({
                'submission_id': submission['id'],
                'date': submitted_date.isoformat(),
                'points': assigned_points,
                'type': submission_type,
                'description': submission_data.get('description', '')
            })
        
        result = {
            'total_points': total_points,
            'submission_count': len(submission_details),
            'submissions': submission_details
        }
        
        logger.debug(f"Staff points result for {subcategory_name}: {total_points} points")
        return result
    
    async def aggregate_performance_ratings(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate performance ratings for quality-based scoring.
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with average rating converted to 0-100 scale
        """
        logger.debug(f"Aggregating performance ratings for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {'average_rating': 0, 'converted_score': 0, 'rating_count': 0, 'submissions': []}

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        if not response.data:
            return {
                'average_rating': 0,
                'converted_score': 0,
                'rating_count': 0,
                'submissions': []
            }
        
        ratings = []
        submission_details = []
        
        for submission in response.data:
            submission_data = submission.get('submission_data', {})
            
            # Check academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # Get rating if present
            rating = submission_data.get('rating')
            if rating is not None:
                rating = float(rating)
                ratings.append(rating)
                
                submission_details.append({
                    'submission_id': submission['id'],
                    'date': submitted_date.isoformat(),
                    'rating': rating
                })
        
        # Calculate average rating
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Convert to 0-100 scale if ratings are on 1-10 scale
        if average_rating > 0 and average_rating <= self.MAX_RATING_SCALE:
            converted_score = average_rating * 10
        else:
            converted_score = average_rating
        
        result = {
            'average_rating': round(average_rating, 2),
            'converted_score': round(converted_score, 2),
            'rating_count': len(ratings),
            'submissions': submission_details
        }
        
        logger.debug(f"Performance rating result for {subcategory_name}: {average_rating:.2f} avg, {converted_score:.2f} converted")
        return result
    
    async def aggregate_binary_monthly_check(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate binary monthly checks for small group and dream team.
        
        Business Rules:
        - Monthly check-ins only
        - Binary present/absent scoring
        - No role multipliers
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with participation percentage
        """
        logger.debug(f"Aggregating monthly checks for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {'participation_percentage': 0, 'present_count': 0, 'total_count': 0, 'submissions': []}

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        if not response.data:
            return {
                'participation_percentage': 0,
                'present_count': 0,
                'total_count': 0,
                'submissions': []
            }
        
        present_count = 0
        total_count = 0
        submission_details = []
        
        # Determine target submission types
        if subcategory_name == 'small_group_involvement':
            target_types = ['small_group']
        elif subcategory_name == 'dream_team_involvement':
            target_types = ['dream_team']
        else:
            target_types = []
        
        for submission in response.data:
            submission_data = submission.get('submission_data', {})
            submission_type = submission_data.get('submission_type', '')
            
            # Check if this matches our target types
            if submission_type not in target_types:
                continue
            
            # Check academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # Check if this is a monthly check (you might need additional logic here)
            status = submission_data.get('status', 'absent')
            if status == 'present':
                present_count += 1
            
            total_count += 1
            submission_details.append({
                'submission_id': submission['id'],
                'date': submitted_date.isoformat(),
                'status': status
            })
        
        # Calculate participation percentage
        participation_percentage = (present_count / total_count * 100) if total_count > 0 else 0
        
        result = {
            'participation_percentage': round(participation_percentage, 2),
            'present_count': present_count,
            'total_count': total_count,
            'submissions': submission_details
        }
        
        logger.debug(f"Monthly check result for {subcategory_name}: {participation_percentage:.1f}% ({present_count}/{total_count})")
        return result
    
    async def aggregate_points_based_scoring(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate points-based scoring for Fellow Friday participation.
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with total points
        """
        logger.debug(f"Aggregating points for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {'total_points': 0, 'submission_count': 0, 'submissions': []}

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        if not response.data:
            return {
                'total_points': 0,
                'submission_count': 0,
                'submissions': []
            }
        
        total_points = 0
        submission_details = []
        
        for submission in response.data:
            submission_data = submission.get('submission_data', {})
            
            # Check if this is a Fellow Friday participation submission
            if submission_data.get('submission_type') != 'fellow_friday':
                continue
            
            # Check academic year
            submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
            if submitted_date.year != academic_year:
                continue
            
            # Get points
            points = float(submission_data.get('points', 0))
            total_points += points
            
            submission_details.append({
                'submission_id': submission['id'],
                'date': submitted_date.isoformat(),
                'points': points
            })
        
        result = {
            'total_points': total_points,
            'submission_count': len(submission_details),
            'submissions': submission_details
        }
        
        logger.debug(f"Points-based result for {subcategory_name}: {total_points} points")
        return result
    
    async def aggregate_attendance_plus_bonus(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> Dict[str, Any]:
        """
        Aggregate attendance plus bonus points for GBE participation.
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Dictionary with attendance percentage and bonus points
        """
        logger.debug(f"Aggregating attendance+bonus for {subcategory_name}, student {student_id}")
        
        subcategory_id = await self._get_subcategory_id_by_name(subcategory_name)
        if not subcategory_id:
            return {
                'attendance_percentage': 0,
                'bonus_points': 0,
                'total_score': 0,
                'attendance_submissions': [],
                'bonus_submissions': []
            }

        attendance_result = await self.aggregate_attendance_percentage(student_id, subcategory_name, academic_year)

        response = self.supabase.table('event_submissions').select(
            'id, submission_data, submitted_at'
        ).eq('student_id', student_id).eq('subcategory_id', subcategory_id).execute()
        
        bonus_points = 0
        bonus_submissions = []
        
        if response.data:
            for submission in response.data:
                submission_data = submission.get('submission_data', {})
                
                # Check if this is a GBE participation submission
                if submission_data.get('submission_type') != 'gbe_participation':
                    continue
                
                # Check academic year
                submitted_date = datetime.fromisoformat(submission['submitted_at']).date()
                if submitted_date.year != academic_year:
                    continue
                
                # Get bonus points
                bonus = float(submission_data.get('bonus_points', 0))
                bonus_points += bonus
                
                if bonus > 0:
                    bonus_submissions.append({
                        'submission_id': submission['id'],
                        'date': submitted_date.isoformat(),
                        'bonus_points': bonus
                    })
        
        # Calculate total score
        total_score = attendance_result['attendance_percentage'] + bonus_points
        
        result = {
            'attendance_percentage': attendance_result['attendance_percentage'],
            'bonus_points': bonus_points,
            'total_score': round(total_score, 2),
            'attendance_submissions': attendance_result['submissions'],
            'bonus_submissions': bonus_submissions
        }
        
        logger.debug(f"Attendance+bonus result for {subcategory_name}: {total_score:.2f} total ({attendance_result['attendance_percentage']:.1f}% + {bonus_points} bonus)")
        return result
    
    async def aggregate_subcategory_score(
        self, 
        student_id: str, 
        subcategory_name: str,
        academic_year: int
    ) -> float:
        """
        Main method to aggregate a subcategory score based on its type.
        
        Args:
            student_id: Student UUID
            subcategory_name: Name of the subcategory
            academic_year: Academic year to process
            
        Returns:
            Aggregated raw score for the subcategory
        """
        logger.debug(f"Aggregating score for subcategory: {subcategory_name}")
        
        try:
            # Route to appropriate aggregation method based on subcategory type
            if subcategory_name == 'community_service_hours':
                result = await self.aggregate_community_service_hours(student_id, academic_year)
                return result['capped_hours']
            
            elif subcategory_name in self.BINARY_ATTENDANCE_SUBCATEGORIES:
                result = await self.aggregate_attendance_percentage(student_id, subcategory_name, academic_year)
                return result['attendance_percentage']
            
            elif subcategory_name in self.STAFF_ASSIGNED_SUBCATEGORIES:
                result = await self.aggregate_staff_assigned_points(student_id, subcategory_name, academic_year)
                return result['total_points']
            
            elif subcategory_name in self.BINARY_MONTHLY_CHECK_SUBCATEGORIES:
                result = await self.aggregate_binary_monthly_check(student_id, subcategory_name, academic_year)
                return result['participation_percentage']
            
            elif subcategory_name in self.PERFORMANCE_RATING_SUBCATEGORIES:
                result = await self.aggregate_performance_ratings(student_id, subcategory_name, academic_year)
                return result['converted_score']
            
            elif subcategory_name == 'fellow_friday_participation':
                result = await self.aggregate_points_based_scoring(student_id, subcategory_name, academic_year)
                return result['total_points']
            
            elif subcategory_name == 'gbe_participation':
                result = await self.aggregate_attendance_plus_bonus(student_id, subcategory_name, academic_year)
                return result['total_score']
            
            else:
                # For Populi grades or unknown subcategories, return 0 for now
                logger.warning(f"Unknown subcategory type: {subcategory_name}")
                return 0.0
                
        except Exception as e:
            logger.error(f"Error aggregating {subcategory_name} for student {student_id}: {str(e)}")
            return 0.0


# Example usage
if __name__ == "__main__":
    # This would be used for testing the aggregator
    print("SubcategoryAggregator - This module should be imported and used with a Supabase client")
