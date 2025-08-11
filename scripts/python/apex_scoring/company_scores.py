"""
apex_scoring.company_scores

Facade for company score calculations.

Initially re-exports existing `CompanyScoreCalculator` to keep runtime stable.
Later, nbdev notebooks can export directly to this module.
"""

try:
    from company_score_calculator import CompanyScoreCalculator as _ImplCompanyScoreCalculator  # type: ignore
except Exception:  # pragma: no cover
    _ImplCompanyScoreCalculator = None  # type: ignore


class CompanyScoreCalculator:  # noqa: D401
    """Facade that delegates to the existing implementation."""

    def __init__(self, supabase_client):
        if _ImplCompanyScoreCalculator is None:
            raise ImportError("company_score_calculator module not available")
        self._impl = _ImplCompanyScoreCalculator(supabase_client)

    async def calculate_all_company_scores(self, academic_year: int, calculation_date=None):
        return await self._impl.calculate_all_company_scores(academic_year, calculation_date)

    async def get_company_rankings(self, academic_year: int, calculation_date=None):
        return await self._impl.get_company_rankings(academic_year, calculation_date)

    async def validate_company_scores(self, academic_year: int, calculation_date=None):
        return await self._impl.validate_company_scores(academic_year, calculation_date)


