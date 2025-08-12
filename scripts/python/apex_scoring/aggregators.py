"""
apex_scoring.aggregators

Facade for subcategory aggregation utilities.

Initially re-exports the existing `SubcategoryAggregator` so runtime stays stable.
Later, nbdev notebooks can export directly to this module.
"""

try:
    from subcategory_aggregators import SubcategoryAggregator as _ImplSubcategoryAggregator  # type: ignore
except Exception:  # pragma: no cover
    _ImplSubcategoryAggregator = None  # type: ignore


class SubcategoryAggregator:  # noqa: D401
    """Facade that delegates to the existing implementation."""

    def __init__(self, supabase_client):
        if _ImplSubcategoryAggregator is None:
            raise ImportError("subcategory_aggregators module not available")
        self._impl = _ImplSubcategoryAggregator(supabase_client)

    # Delegate public methods we rely on
    async def aggregate_community_service_hours(self, student_id: str, academic_year: int):
        return await self._impl.aggregate_community_service_hours(student_id, academic_year)

    async def aggregate_attendance_percentage(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_attendance_percentage(student_id, subcategory_name, academic_year)

    async def aggregate_staff_assigned_points(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_staff_assigned_points(student_id, subcategory_name, academic_year)

    async def aggregate_performance_ratings(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_performance_ratings(student_id, subcategory_name, academic_year)

    async def aggregate_binary_monthly_check(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_binary_monthly_check(student_id, subcategory_name, academic_year)

    async def aggregate_points_based_scoring(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_points_based_scoring(student_id, subcategory_name, academic_year)

    async def aggregate_attendance_plus_bonus(self, student_id: str, subcategory_name: str, academic_year: int):
        return await self._impl.aggregate_attendance_plus_bonus(student_id, subcategory_name, academic_year)

    async def aggregate_subcategory_score(self, student_id: str, subcategory_name: str, academic_year: int) -> float:
        return await self._impl.aggregate_subcategory_score(student_id, subcategory_name, academic_year)



