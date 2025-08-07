#!/usr/bin/env python3
"""
ACU Apex Holistic GPA Scoring System - Bell Curve Calculator

This module implements the bell curve transformation logic for converting
raw scores to normalized GPA values using a left-weighted normal distribution.

The algorithm creates a distribution with:
- Mean: 3.0 (target average GPA)
- Standard Deviation: 0.6 (prevents extreme outliers)
- Left skew: More students in 2.5-3.5 range than 3.5-4.0
- Range: 0.0 to 4.0

Author: ACU Apex Development Team
Date: 2024
"""

import numpy as np
from scipy import stats
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class BellCurveCalculator:
    """
    Implements bell curve transformation for holistic GPA scoring.
    
    This class provides methods to convert raw scores to normalized GPA values
    using a left-weighted normal distribution that ensures fair scoring while
    maintaining educational standards.
    """
    
    # Bell curve parameters
    TARGET_MEAN = 3.0           # Target average GPA
    STD_DEVIATION = 0.6         # Standard deviation to prevent extreme outliers
    LEFT_SKEW_FACTOR = 0.8      # Factor to create left-weighted distribution
    MIN_GPA = 0.0              # Minimum possible GPA
    MAX_GPA = 4.0              # Maximum possible GPA
    MIN_PERCENTILE = 0.001     # Minimum percentile for mathematical stability
    MAX_PERCENTILE = 0.999     # Maximum percentile for mathematical stability
    
    def __init__(self):
        """Initialize the bell curve calculator."""
        logger.info(f"Initialized BellCurveCalculator with mean={self.TARGET_MEAN}, std_dev={self.STD_DEVIATION}")
    
    def calculate_percentile_rank(self, raw_score: float, all_raw_scores: List[float]) -> float:
        """
        Calculate the percentile rank for a given raw score within a population.
        
        Args:
            raw_score: The raw score to calculate percentile for
            all_raw_scores: List of all raw scores in the population
            
        Returns:
            Percentile rank between 0.001 and 0.999 for mathematical stability
        """
        if not all_raw_scores:
            return 0.5  # Middle percentile if no scores
        
        # Count scores below the given raw score
        scores_below = sum(1 for score in all_raw_scores if score < raw_score)
        total_scores = len(all_raw_scores)
        
        # Calculate percentile rank (0.0 to 1.0)
        percentile_rank = scores_below / total_scores
        
        # Ensure we don't have exact 0 or 1 for mathematical stability
        percentile_rank = max(self.MIN_PERCENTILE, min(self.MAX_PERCENTILE, percentile_rank))
        
        return percentile_rank
    
    def transform_percentile_to_gpa(self, percentile_rank: float) -> float:
        """
        Transform a percentile rank to a GPA score using left-weighted normal distribution.
        
        This method implements the core bell curve algorithm that creates the desired
        distribution shape with more students clustered around 2.5-3.5 than at extremes.
        
        Args:
            percentile_rank: Percentile rank between 0.0 and 1.0
            
        Returns:
            GPA score between 0.0 and 4.0
        """
        # Input validation
        if percentile_rank is None or percentile_rank <= 0 or percentile_rank >= 1:
            return 0.0
        
        # Convert percentile to z-score using inverse normal CDF
        # This creates a standard normal distribution
        z_score = stats.norm.ppf(percentile_rank)
        
        # Apply left skew by reducing positive z-scores more than negative ones
        # This creates the desired left-weighted distribution where fewer students
        # achieve very high GPAs, making excellence more meaningful
        if z_score > 0:
            z_score = z_score * self.LEFT_SKEW_FACTOR
        
        # Transform to our target distribution (mean=3.0, std_dev=0.6)
        gpa_score = self.TARGET_MEAN + (self.STD_DEVIATION * z_score)
        
        # Ensure GPA stays within valid bounds (0.0 to 4.0)
        gpa_score = max(self.MIN_GPA, min(self.MAX_GPA, gpa_score))
        
        # Round to 2 decimal places for consistency
        return round(gpa_score, 2)
    
    def calculate_distribution_stats(self, raw_scores: List[float]) -> dict:
        """
        Calculate statistics for the raw score distribution.
        
        Args:
            raw_scores: List of raw scores
            
        Returns:
            Dictionary containing distribution statistics
        """
        if not raw_scores:
            return {
                'count': 0,
                'mean': 0.0,
                'std_dev': 0.0,
                'min': 0.0,
                'max': 0.0,
                'percentiles': {}
            }
        
        scores_array = np.array(raw_scores)
        
        return {
            'count': len(raw_scores),
            'mean': float(np.mean(scores_array)),
            'std_dev': float(np.std(scores_array)),
            'min': float(np.min(scores_array)),
            'max': float(np.max(scores_array)),
            'percentiles': {
                '10th': float(np.percentile(scores_array, 10)),
                '25th': float(np.percentile(scores_array, 25)),
                '50th': float(np.percentile(scores_array, 50)),
                '75th': float(np.percentile(scores_array, 75)),
                '90th': float(np.percentile(scores_array, 90))
            }
        }
    
    def apply_bell_curve_to_scores(
        self, 
        raw_scores: List[float]
    ) -> Tuple[List[float], dict]:
        """
        Apply bell curve transformation to a list of raw scores.
        
        Args:
            raw_scores: List of raw scores to transform
            
        Returns:
            Tuple of (normalized_scores, statistics)
        """
        if not raw_scores:
            return [], {'raw_stats': {}, 'normalized_stats': {}}
        
        # Calculate raw score statistics
        raw_stats = self.calculate_distribution_stats(raw_scores)
        
        # Transform each score
        normalized_scores = []
        for raw_score in raw_scores:
            percentile = self.calculate_percentile_rank(raw_score, raw_scores)
            gpa_score = self.transform_percentile_to_gpa(percentile)
            normalized_scores.append(gpa_score)
        
        # Calculate normalized score statistics
        normalized_stats = self.calculate_distribution_stats(normalized_scores)
        
        # Log transformation results
        logger.info(f"Bell curve transformation completed:")
        logger.info(f"  Raw scores - Mean: {raw_stats['mean']:.2f}, Std: {raw_stats['std_dev']:.2f}")
        logger.info(f"  Normalized scores - Mean: {normalized_stats['mean']:.2f}, Std: {normalized_stats['std_dev']:.2f}")
        logger.info(f"  Target mean: {self.TARGET_MEAN}, Target std: {self.STD_DEVIATION}")
        
        return normalized_scores, {
            'raw_stats': raw_stats,
            'normalized_stats': normalized_stats
        }
    
    def validate_distribution(self, normalized_scores: List[float]) -> dict:
        """
        Validate that the normalized scores meet our distribution requirements.
        
        Args:
            normalized_scores: List of normalized GPA scores
            
        Returns:
            Dictionary with validation results
        """
        if not normalized_scores:
            return {'valid': False, 'reason': 'No scores to validate'}
        
        scores_array = np.array(normalized_scores)
        actual_mean = np.mean(scores_array)
        actual_std = np.std(scores_array)
        
        # Check if mean is within acceptable range (2.8 - 3.2)
        mean_valid = 2.8 <= actual_mean <= 3.2
        
        # Check if standard deviation is reasonable (0.4 - 0.8)
        std_valid = 0.4 <= actual_std <= 0.8
        
        # Check if all scores are within valid GPA range
        range_valid = all(self.MIN_GPA <= score <= self.MAX_GPA for score in scores_array)
        
        # Check distribution shape - should have more students in middle ranges
        below_2_5 = sum(1 for score in scores_array if score < 2.5) / len(scores_array)
        between_2_5_3_5 = sum(1 for score in scores_array if 2.5 <= score <= 3.5) / len(scores_array)
        above_3_5 = sum(1 for score in scores_array if score > 3.5) / len(scores_array)
        
        # Expect most students (60%+) in the 2.5-3.5 range
        distribution_valid = between_2_5_3_5 >= 0.6
        
        validation_result = {
            'valid': mean_valid and std_valid and range_valid and distribution_valid,
            'actual_mean': float(actual_mean),
            'actual_std': float(actual_std),
            'mean_valid': mean_valid,
            'std_valid': std_valid,
            'range_valid': range_valid,
            'distribution_valid': distribution_valid,
            'distribution_breakdown': {
                'below_2_5': float(below_2_5),
                'between_2_5_3_5': float(between_2_5_3_5),
                'above_3_5': float(above_3_5)
            }
        }
        
        if not validation_result['valid']:
            logger.warning(f"Bell curve validation failed: {validation_result}")
        else:
            logger.info(f"Bell curve validation passed: mean={actual_mean:.2f}, std={actual_std:.2f}")
        
        return validation_result
    
    def get_target_gpa_for_percentile(self, percentile: float) -> float:
        """
        Get the target GPA for a specific percentile.
        
        Useful for understanding what GPA corresponds to different performance levels.
        
        Args:
            percentile: Percentile (0.0 to 1.0)
            
        Returns:
            Target GPA for that percentile
        """
        if not 0 <= percentile <= 1:
            raise ValueError("Percentile must be between 0 and 1")
        
        return self.transform_percentile_to_gpa(percentile)
    
    def get_percentile_benchmarks(self) -> dict:
        """
        Get GPA values for key percentile benchmarks.
        
        Returns:
            Dictionary with GPA values for important percentiles
        """
        benchmarks = {}
        key_percentiles = [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]
        
        for percentile in key_percentiles:
            gpa = self.get_target_gpa_for_percentile(percentile)
            benchmarks[f"{int(percentile * 100)}th"] = gpa
        
        return benchmarks


# Example usage and testing
if __name__ == "__main__":
    # Example usage of the BellCurveCalculator
    calculator = BellCurveCalculator()
    
    # Generate some sample raw scores for testing
    np.random.seed(42)  # For reproducible results
    sample_raw_scores = np.random.normal(75, 15, 1000).tolist()  # Mean 75, std 15
    sample_raw_scores = [max(0, min(100, score)) for score in sample_raw_scores]  # Clamp to 0-100
    
    print("Bell Curve Calculator Test")
    print("=" * 40)
    
    # Apply bell curve transformation
    normalized_scores, stats = calculator.apply_bell_curve_to_scores(sample_raw_scores)
    
    # Print statistics
    print(f"Raw scores: {len(sample_raw_scores)} students")
    print(f"Raw mean: {stats['raw_stats']['mean']:.2f}, std: {stats['raw_stats']['std_dev']:.2f}")
    print(f"Normalized mean: {stats['normalized_stats']['mean']:.2f}, std: {stats['normalized_stats']['std_dev']:.2f}")
    
    # Validate distribution
    validation = calculator.validate_distribution(normalized_scores)
    print(f"Distribution valid: {validation['valid']}")
    print(f"Students in 2.5-3.5 range: {validation['distribution_breakdown']['between_2_5_3_5']:.1%}")
    
    # Show percentile benchmarks
    print("\nPercentile Benchmarks:")
    benchmarks = calculator.get_percentile_benchmarks()
    for percentile, gpa in benchmarks.items():
        print(f"  {percentile} percentile: {gpa:.2f} GPA")
