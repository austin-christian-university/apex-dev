from __future__ import annotations

# Exported from nbdev notebooks (01-subcategory-aggregators.ipynb)
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from supabase import Client
from apex_scoring.bell_curve import BellCurveCalculator

logger = logging.getLogger(__name__)


class SubcategoryAggregator:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.bell_curve = BellCurveCalculator()
        # GPA subcategory ids excluded from curve
        self.GPA_SUBCATEGORY_IDS = {
            'f50830fe-b820-4223-89e2-e69241b459af',
            '8d13f1b9-33e1-4a62-be45-488a6834112f',
            'd1d972a4-2484-4b9a-a53c-0b63bb2e952c',
        }

    def get_subcategories(self) -> List[Dict[str, Any]]:
        resp = self.supabase.table('subcategories').select('id,name').execute()
        return resp.data or []

    def get_students(self) -> List[Dict[str, Any]]:
        resp = self.supabase.table('students').select('id').execute()
        return resp.data or []

    def _get_latest_scores_for_subcategory(self, subcategory_id: str) -> List[Dict[str, Any]]:
        latest_resp = (
            self.supabase
            .table('student_subcategory_scores')
            .select('calculation_date')
            .eq('subcategory_id', subcategory_id)
            .order('calculation_date', desc=True)
            .limit(1)
            .execute()
        )
        if not latest_resp.data:
            return []
        latest_date = latest_resp.data[0]['calculation_date']
        rows_resp = (
            self.supabase
            .table('student_subcategory_scores')
            .select('id, student_id, score, calculation_date')
            .eq('subcategory_id', subcategory_id)
            .eq('calculation_date', latest_date)
            .execute()
        )
        return rows_resp.data or []

    def _normalize_latest_subcategory_scores(self, subcategory_id: str) -> dict:
        rows = self._get_latest_scores_for_subcategory(subcategory_id)
        if not rows:
            return {'normalized': False, 'reason': 'No rows to process', 'count': 0}

        if subcategory_id in self.GPA_SUBCATEGORY_IDS:
            updated_count = 0
            for row in rows:
                if row.get('score') is not None:
                    self.supabase.table('student_subcategory_scores').update({
                        'normalized_score': float(row['score'])
                    }).eq('id', row['id']).execute()
                    updated_count += 1
            return {
                'normalized': False,
                'reason': 'GPA subcategory - normalized_score set to raw score',
                'count': updated_count,
            }

        raw_scores = [float(r['score']) for r in rows if r.get('score') is not None]
        if not raw_scores:
            return {'normalized': False, 'reason': 'No scores to normalize', 'count': 0}

        normalized_scores, stats = self.bell_curve.apply_bell_curve_to_scores(raw_scores)
        for row, norm in zip(rows, normalized_scores):
            self.supabase.table('student_subcategory_scores').update({
                'normalized_score': float(norm)
            }).eq('id', row['id']).execute()

        return {
            'normalized': True,
            'count': len(normalized_scores),
            'raw_stats': stats.get('raw_stats'),
            'normalized_stats': stats.get('normalized_stats'),
        }

    def normalize_all_subcategories_for_latest_day(self) -> dict:
        latest_resp = (
            self.supabase
            .table('student_subcategory_scores')
            .select('calculation_date')
            .order('calculation_date', desc=True)
            .limit(1)
            .execute()
        )
        if not latest_resp.data:
            return {}
        latest_date = latest_resp.data[0]['calculation_date']
        sub_resp = (
            self.supabase
            .table('student_subcategory_scores')
            .select('subcategory_id')
            .eq('calculation_date', latest_date)
            .execute()
        )
        sub_ids = sorted({r['subcategory_id'] for r in (sub_resp.data or [])})
        results = {}
        for sid in sub_ids:
            results[sid] = self._normalize_latest_subcategory_scores(sid)
        return {'latest_date': latest_date, 'results': results}
