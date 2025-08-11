"""
apex_scoring.bell_curve

Bell curve transformation logic for converting raw scores to normalized GPA values
using a left-weighted normal distribution.
"""

import numpy as np
from scipy import stats
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class BellCurveCalculator:
    """
    Implements bell curve transformation for holistic GPA scoring.
    """

    # Bell curve parameters
    TARGET_MEAN = 3.0
    STD_DEVIATION = 0.6
    LEFT_SKEW_FACTOR = 0.8
    MIN_GPA = 0.0
    MAX_GPA = 4.0
    MIN_PERCENTILE = 0.001
    MAX_PERCENTILE = 0.999

    def __init__(self) -> None:
        logger.info(
            f"Initialized BellCurveCalculator with mean={self.TARGET_MEAN}, std_dev={self.STD_DEVIATION}"
        )

    def calculate_percentile_rank(self, raw_score: float, all_raw_scores: List[float]) -> float:
        if not all_raw_scores:
            return 0.5
        scores_below = sum(1 for score in all_raw_scores if score < raw_score)
        total_scores = len(all_raw_scores)
        percentile_rank = scores_below / total_scores
        percentile_rank = max(self.MIN_PERCENTILE, min(self.MAX_PERCENTILE, percentile_rank))
        return percentile_rank

    def transform_percentile_to_gpa(self, percentile_rank: float) -> float:
        if percentile_rank is None or percentile_rank <= 0 or percentile_rank >= 1:
            return 0.0
        z_score = stats.norm.ppf(percentile_rank)
        if z_score > 0:
            z_score = z_score * self.LEFT_SKEW_FACTOR
        gpa_score = self.TARGET_MEAN + (self.STD_DEVIATION * z_score)
        gpa_score = max(self.MIN_GPA, min(self.MAX_GPA, gpa_score))
        return round(gpa_score, 2)

    def calculate_distribution_stats(self, raw_scores: List[float]) -> dict:
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
        if not raw_scores:
            return [], {'raw_stats': {}, 'normalized_stats': {}}
        raw_stats = self.calculate_distribution_stats(raw_scores)
        normalized_scores = []
        for raw_score in raw_scores:
            percentile = self.calculate_percentile_rank(raw_score, raw_scores)
            gpa_score = self.transform_percentile_to_gpa(percentile)
            normalized_scores.append(gpa_score)
        normalized_stats = self.calculate_distribution_stats(normalized_scores)
        logger.info("Bell curve transformation completed:")
        logger.info(f"  Raw scores - Mean: {raw_stats['mean']:.2f}, Std: {raw_stats['std_dev']:.2f}")
        logger.info(f"  Normalized scores - Mean: {normalized_stats['mean']:.2f}, Std: {normalized_stats['std_dev']:.2f}")
        logger.info(f"  Target mean: {self.TARGET_MEAN}, Target std: {self.STD_DEVIATION}")
        return normalized_scores, {
            'raw_stats': raw_stats,
            'normalized_stats': normalized_stats
        }

    def validate_distribution(self, normalized_scores: List[float]) -> dict:
        if not normalized_scores:
            return {'valid': False, 'reason': 'No scores to validate'}
        scores_array = np.array(normalized_scores)
        actual_mean = np.mean(scores_array)
        actual_std = np.std(scores_array)
        mean_valid = 2.8 <= actual_mean <= 3.2
        std_valid = 0.4 <= actual_std <= 0.8
        range_valid = all(self.MIN_GPA <= score <= self.MAX_GPA for score in scores_array)
        below_2_5 = sum(1 for score in scores_array if score < 2.5) / len(scores_array)
        between_2_5_3_5 = sum(1 for score in scores_array if 2.5 <= score <= 3.5) / len(scores_array)
        above_3_5 = sum(1 for score in scores_array if score > 3.5) / len(scores_array)
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
        if not 0 <= percentile <= 1:
            raise ValueError("Percentile must be between 0 and 1")
        return self.transform_percentile_to_gpa(percentile)

    def get_percentile_benchmarks(self) -> dict:
        benchmarks = {}
        key_percentiles = [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99]
        for percentile in key_percentiles:
            gpa = self.get_target_gpa_for_percentile(percentile)
            benchmarks[f"{int(percentile * 100)}th"] = gpa
        return benchmarks


