## Holistic GPA Calculation

This document explains the data flow, math, and infrastructure used to compute Student and Company Holistic GPAs. It covers how raw inputs from event submissions are aggregated, normalized with a left‑weighted bell curve, and written back into the database daily.

### Goals
- Consistent, objective scoring across diverse subcategories
- A left‑weighted bell curve with target mean 3.0 on a 0.0–4.0 GPA scale
- Daily snapshots for students and companies
- Scalable pipeline (local Python development → AWS Lambda in production)


## Data Flow Overview
1. Event data collected in `event_submissions`
2. Subcategory aggregation per student (raw → points)
3. Population percentile rank per subcategory
4. Bell curve transform to 0.0–4.0 GPA
5. Category GPA per student (avg/weighted of subcategories)
6. Holistic GPA per student (avg of category GPAs)
7. Company subcategory/category/holistic scores (averages of student scores)

Primary tables:
- `student_subcategory_scores` (daily)
- `student_category_scores` (daily)
- `student_holistic_gpa` (daily)
- `company_subcategory_scores` (daily)
- `company_category_scores` (daily)
- `company_holistic_gpa` (daily)


## Subcategory Aggregation (Raw → Points)
Aggregation rules transform heterogeneous inputs into comparable raw points per student and subcategory. Below are the implemented rules:

- Binary attendance (e.g., chapel, company community events)
  - present_count / total_count × 100
  - If total_count = 0 → 0

- Monthly checks (e.g., small group involvement, dream team involvement)
  - present_count / total_checks × 100

- Hours‑based (community service)
  - Per submission: cap daily to 8 hours
  - Annual cap: min(sum(hours), 12)

- Staff‑assigned points (e.g., credentials, job promotions)
  - Sum of `assigned_points`

- Officer-assigned points (engagement quality)
  - Fellow Friday Team engagement, GBE Team engagement, Chapel Team
  - Score 1-5 for each

- Grades
  - spiritual formation grade, overall gpa, practicum grade
  - All directly imported

- Community service
  - Capped at 12, raw hours besides that

- Lions Games
  - For now, raw points assigned by officers or staff

- Community Involvement (Small group, Dream Team)
  - Monthly check-in, self-reported
  - Shows


Each subcategory record stores:
- `raw_points`: aggregated value before curve
- `data_points_count`: number of submissions included
- `total_possible_points`: optional upper bound for QA/validation


### Subcategory Reference (Inputs & Aggregation)

Documented below are all current subcategories in the database, their expected input types, typical data sources, and the aggregation rule used to convert raw inputs into raw points (0–100) prior to percentile/bell-curve normalization.

- Spiritual
  - Chapel Attendance (`chapel_attendance`)
    - Expected input: Binary attendance (present/absent per instance)
    - Data source: student_input
    - Aggregation: present_count / total_count × 100
  - Chapel Team Participation (`chapel_participation`)
    - Expected input: Engagement quality (1–5 per participation instance)
    - Data source: student_input
    - Aggregation: Average(rating) × 20 → 0–100
  - Community Service Hours (`community_service_hours`)
    - Expected input: Hours per submission
    - Data source: student_input
    - Aggregation: Cap daily to 8 hours; annual cap min(sum(hours), 12). Map proportion of 12 hours to 0–100.
  - Dream Team Involvement (`dream_team_involvement`)
    - Expected input: Monthly check (present/absent)
    - Data source: student_input
    - Aggregation: present_months / total_months × 100. No role multipliers.
  - Fellow Friday Attendance (`fellow_friday_attendance`)
    - Expected input: Binary attendance (present/absent per instance)
    - Data source: student_input
    - Aggregation: present_count / total_count × 100
  - GBE Attendance (`gbe_attendance`)
    - Expected input: Binary attendance (present/absent per instance)
    - Data source: student_input
    - Aggregation: present_count / total_count × 100
  - Small Group Involvement (`small_group_involvement`)
    - Expected input: Monthly check (present/absent)
    - Data source: student_input
    - Aggregation: present_months / total_months × 100
  - Spiritual Formation Grade (`spiritual_formation_grade`)
    - Expected input: Percent grade (0–100)
    - Data source: populi
    - Aggregation: Use provided percent; if provided as points, convert to percent

- Academic
  - Academic Class Attendance & Grades (`class_attendance_grades`)
    - Expected input: Attendance percent and/or course grade percent
    - Data source: populi
    - Aggregation: Performance ratio Sum(rating)/Sum(max_rating) × 100 (or direct grade percent)

- Professional
  - Credentials or Certifications (`credentials_certifications`)
    - Expected input: Staff-assigned points per credential (entered upon staff review)
    - Data source: student_input (submitted), scored by staff
    - Aggregation: Sum(assigned_points)
  - Fellow Friday Team Participation (`fellow_friday_participation`)
    - Expected input: Points-based participation score per instance
    - Data source: student_input
    - Aggregation: Sum(participation_points)
  - Job or Campus Role Promotion/Resume-Building Opportunities (`job_promotion_opportunities`)
    - Expected input: Staff-assigned points per promotion/opportunity
    - Data source: student_input (submitted), scored by staff
    - Aggregation: Sum(assigned_points)
  - Practicum Grade (`practicum_grade`)
    - Expected input: Percent grade (0–100)
    - Data source: populi
    - Aggregation: Use provided percent

- Team
  - Company Community Events (`company_community_events`)
    - Expected input: Binary attendance (present/absent per instance)
    - Data source: student_input
    - Aggregation: present_count / total_count × 100
  - Company Team-Building (`company_team_building`)
    - Expected input: Participation engagement rating (1–5 per event)
    - Data source: officer_input
    - Aggregation: Average(rating) × 20 → 0–100 (rank/scale-based participation)
  - GBE Participation (`gbe_participation`)
    - Expected input: Attendance plus bonus points for roles/extra effort
    - Data source: officer_input
    - Aggregation: attendance_percent + Sum(bonus_points) (clamp to 0–100 if needed)
  - Lions Games Involvement (`lions_games_involvement`)
    - Expected input: Staff-assigned points
    - Data source: staff_input
    - Aggregation: Sum(assigned_points)

Notes
- Where multiple inputs exist (e.g., attendance + bonus), clamp combined raw points to [0, 100] before percentile/bell curve.
- Monthly checks behave like attendance but at a monthly cadence.
- Community service caps: per-submission daily cap 8 hours; annual cap 12 hours.
- Staff/officer-assigned points are authoritative; student submissions can initiate review but do not auto-award points.


## From Raw Points to GPA

### 1) Percentile Rank (population reference)
For each subcategory and day, compute a student’s percentile rank among active students for the same academic year. Conceptually:

- Sort all students by `raw_points` for subcategory S
- Compute percentile rank in [0, 1]
- Ties get average rank

The DB provides a helper: `calculate_percentile_rank(raw_score numeric, subcategory_uuid uuid, academic_year_start int, calculation_date date)`.

### 2) Bell Curve Transform (left‑weighted, mean 3.0)
We map percentile ∈ [0,1] → GPA ∈ [0.0,4.0] using an inverse CDF of Normal plus a skew factor:

Python (reference):
```python
from scipy.stats import norm

def calculate_gpa_from_percentile(percentile: float, mean: float = 3.0, std_dev: float = 0.6, skew_factor: float = 0.8) -> float:
    # Clamp
    p = max(0.001, min(0.999, percentile))
    z = norm.ppf(p)
    gpa = mean + (std_dev * z * skew_factor)
    return max(0.0, min(4.0, gpa))
```

SQL (reference function available):
```sql
-- calculate_gpa_from_percentile(percentile NUMERIC) RETURNS NUMERIC
-- Uses Normal PPF with target mean 3.0, stddev 0.6, and skew factor applied to z
```

Notes:
- Target mean: 3.0
- Target std dev: 0.6
- “Left‑weighted” behavior is achieved by multiplying z by a `skew_factor < 1.0` to compress the upper tail relative to the target spread. Tuneable as needed.
- Output is clamped to [0.0, 4.0]


## Category and Holistic GPAs (Students)
- Student Category GPA:
  - Default: average of that student’s subcategory GPAs in the category
  - Supports subcategory weights via `subcategories.weight` (default 1.0)
- Student Holistic GPA:
  - Default: average of the 4 category GPAs (supports category weights via `categories.weight`)

Persistence per day to:
- `student_category_scores(normalized_score)`
- `student_holistic_gpa(holistic_gpa, category_breakdown)`


## Company Scoring
- Company Subcategory Score (daily):
  - `raw_points` = average of student `raw_points` in company
  - `normalized_score` = average of student `normalized_score` in company
  - Saved to `company_subcategory_scores`

- Company Category Score (daily):
  - Average of company subcategory scores within that category
  - Saved to `company_category_scores`

- Company Holistic GPA (daily):
  - Average of company category GPAs
  - Saved to `company_holistic_gpa`, with `category_breakdown`


## Idempotency and History
- All daily tables include `calculation_date` and unique constraints per entity and date (e.g., `(student_id, subcategory_id, calculation_date)`)
- Pipeline is safe to re‑run for a day; records upsert via `ON CONFLICT` where defined


## Performance & Reliability
- DB: GIN/BTREE indexes on foreign keys, dates, and lookups
- Batch processing for students in Python when needed
- Aggregations push down to SQL where efficient
- Validation scripts check coverage and distribution


## Local Development
- Location: `scripts/python/`
- Setup:
  - `./setup.sh` → venv + deps + `.env`
  - `python daily_score_calculation.py`
- Env vars (see `scripts/python/env.example`):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Optional scoring tunables (mean/std/skew)


## Production Architecture (AWS)

### Runtime
- **AWS Lambda**: Python 3.11 container image
  - Built from `scripts/python/Dockerfile`
  - Deployed via `scripts/python/aws-deploy.sh`
- **Environment variables**:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Optional: place secrets in AWS Secrets Manager and load at init
- **Networking**: public Lambda (or VPC if required by org policy)

### Scheduling
- **Amazon EventBridge (CloudWatch Events) Rule**
  - Triggers the Lambda daily at 02:00 (UTC) (example schedule)
  - Example expression: `cron(0 2 * * ? *)`

### Observability
- **CloudWatch Logs**: structured logs from Python
- **Metrics/Alarms** (recommended):
  - Invocation errors, duration, throttles
  - Custom logs scraping for anomaly detection
- **Retries/DLQ**:
  - Lambda retry policy (default 2 retries)
  - Optional DLQ (SQS) on failure

### Security
- **Least privilege IAM role** for Lambda
- **No client keys** in code; use environment/Secrets Manager
- **RLS** remains on database tables; service role performs server‑side writes


## Orchestration
- Orchestrator function (DB): `run_daily_score_calculation(academic_year_start, calculation_date)` performs:
  1) Student subcategory aggregation
  2) Category GPAs
  3) Student holistic GPAs
  4) Company subcategory/category/holistic
- Python can also orchestrate by calling DB functions (RPC) when needed (local testing or hybrid mode)


## Validation & QA
- Coverage: ensure all students have scores for all applicable subcategories by day
- Distribution checks: holistic GPA mean ≈ 3.0; expected proportion within [2.4, 3.6]
- Data integrity: unique constraints per entity/date; non‑null normalized outputs


## Change Management & Tuning
- Adjust `skew_factor`, mean, or std dev to shape distribution
- Introduce/adjust subcategory weights in `subcategories.weight`
- Introduce/adjust category weights in `categories.weight`
- Add new subcategory aggregation rules following the same pattern


## References
- Student context: `docs/STUDENT_APP_CONTEXT.md`
- Schema planning: `docs/DATABASE_SCHEMA_PLANNING.md`
- Scoring system overview: `.cursor/docs/scoring_system.md`
- Python system README: `scripts/python/README.md`


## Python Modules & Call Order

Location: `scripts/python/`

- `daily_score_calculation.py`
  - Orchestrator class `DailyScoreCalculator`
  - Entrypoint for daily runs (local or Lambda)
  - Steps:
    1) Fetch students for academic year
    2) Calculate student subcategory raw scores (calls DB functions via RPC as needed)
    3) Apply bell curve across population (DB helper for percentile → GPA transform)
    4) Calculate student category scores
    5) Calculate student holistic GPAs
    6) Calculate company subcategory/category/holistic scores
    7) Validation summary (optional)

- `subcategory_aggregators.py`
  - Functions that compute raw points for each subcategory type by reading `event_submissions` and related tables
  - Mirrors business rules (binary, hours with caps, staff‑assigned points, engagement, performance, GBE, etc.)
  - Used for local ad‑hoc runs and parity with SQL implementations

- `bell_curve_calculator.py`
  - Pure math transform from percentile → GPA
  - Reference implementation of left‑weighted normal mapping used by DB function

- `company_score_calculator.py`
  - High‑level helper to compute company subcategory/category/holistic scores for all companies
  - Invokes DB functions via RPC to aggregate and persist results

- `score_validator.py`
  - Integrity checks after a run (coverage of subcategories, distribution sanity, GPA ranges, etc.)

- `generate_dummy_data.py`
  - Generates realistic test data across all 17 subcategories for a test student (and can be extended)

- Infra helpers
  - `setup.sh`: venv + deps + `.env` bootstrap
  - `aws-deploy.sh`: package & deploy Lambda (container or zip)
  - `Dockerfile`, `docker-compose.yml`: containerized local dev & optional Jupyter profile

### Typical Call Order (Local)
1) `python daily_score_calculation.py`
2) Inside `DailyScoreCalculator.run_daily_calculation()`:
   - `_calculate_subcategory_scores(...)` → raw points per student/subcategory
   - `_apply_bell_curve_normalization(...)` → normalized GPA per student/subcategory
   - `_calculate_category_scores(...)` → per student/category
   - `_calculate_holistic_gpas(...)` → per student
   - `_update_company_standings(...)` → company subcategory/category/holistic
3) Optional: `score_validator.py` checks

### Typical Call Order (Production / AWS Lambda)
- EventBridge (CloudWatch Events) triggers the Lambda handler (container runs `daily_score_calculation.py`)
- Same internal sequence as local run
- Logs to CloudWatch; failures retried per Lambda policy


## Backend Interactions (Supabase/Postgres)

- Authentication
  - Uses `SUPABASE_SERVICE_ROLE_KEY` (server‑side, secure) to perform writes

- Reads
  - `event_submissions` joined with `event_instances`/`recurring_events`/`subcategories` to aggregate raw points
  - `students`, `companies`, `categories`, `subcategories` metadata

- Writes (daily snapshots)
  - `student_subcategory_scores(raw_points, normalized_score, data_points_count, total_possible_points, calculation_date, academic_year_start, academic_year_end)`
  - `student_category_scores(raw_score, normalized_score, calculation_date, ...)`
  - `student_holistic_gpa(holistic_gpa, category_breakdown, calculation_date, ...)`
  - `company_subcategory_scores(raw_points, normalized_score, calculation_date, ...)`
  - `company_category_scores(raw_score, normalized_score, calculation_date, ...)`
  - `company_holistic_gpa(holistic_gpa, category_breakdown, calculation_date, ...)`

- RPC / SQL functions used (examples)
  - `calculate_student_subcategory_scores(student_uuid, academic_year, date)`
  - `calculate_student_category_scores(student_uuid, academic_year, date)`
  - `calculate_student_holistic_gpa(student_uuid, academic_year, date)`
  - `calculate_company_subcategory_scores(company_id, academic_year, date)`
  - `calculate_company_category_scores(company_id, academic_year, date)`
  - `calculate_company_holistic_gpa(company_id, academic_year, date)`
  - `run_daily_score_calculation(academic_year, date)` (DB‑side orchestrator)

- Idempotency
  - Tables enforce `UNIQUE(entity_id, [sub|category]_id?, calculation_date)`
  - Upserts update the same row if re‑run for the day


## Execution Modes

- Pure SQL path (fastest)
  - Python triggers DB RPCs, and Postgres functions aggregate and persist data

- Hybrid path (development / data science)
  - Python `subcategory_aggregators.py` pulls submissions → computes raw → writes results
  - Bell curve via Python math module if desired for offline experiments

- Full Python path (optional)
  - Possible to compute everything in Python and write scores; kept mainly for experimentation


## Error Handling & Logging
- Python: structured logging at INFO/ERROR; debug logs around each phase
- DB: PL/pgSQL functions raise `NOTICE` per phase for traceability
- Production: CloudWatch Logs, optional alarms on error metrics
