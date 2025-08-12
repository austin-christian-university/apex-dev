"""
apex_scoring.validator

Facade for score validation utilities.
"""

try:
    from score_validator import ScoreValidator as _ImplScoreValidator  # type: ignore
except Exception:  # pragma: no cover
    _ImplScoreValidator = None  # type: ignore


class ScoreValidator:  # noqa: D401
    """Facade that delegates to the existing implementation."""

    def __init__(self, supabase_client):
        if _ImplScoreValidator is None:
            raise ImportError("score_validator module not available")
        self._impl = _ImplScoreValidator(supabase_client)

    async def validate_daily_calculation(self, academic_year: int, calculation_date=None):
        return await self._impl.validate_daily_calculation(academic_year, calculation_date)

    async def generate_validation_report(self, validation_results):
        return await self._impl.generate_validation_report(validation_results)



