# Holistic GPA Scoring System Implementation

Comprehensive student development tracking system that calculates holistic GPAs across four categories (Spiritual, Professional, Academic, Team) using a bell curve distribution with 3.0 average and left-weighted distribution. The system aggregates data from event submissions, applies normalization, and maintains historical tracking for competitive company rankings.

## Completed Tasks

- [x] Analyzed current database schema and existing tables
- [x] Designed bell curve distribution algorithm with 3.0 average and left-weighted distribution
- [x] Planned table restructuring and new table creation
- [x] Designed daily scoring calculation pipeline
- [x] Planned data aggregation strategies for different subcategory types
- [x] Designed database functions for calculations
- [x] Planned dummy data generation for test student
- [x] Designed historical tracking system with daily snapshots
- [x] Create comprehensive task list with implementation details

## In Progress Tasks

- [ ] Begin Phase 1: Database Schema Changes

## Future Tasks

### Phase 1: Database Schema Changes
- [ ] Rename `student_scores` table to `student_subcategory_scores`
- [ ] Add new fields to `student_subcategory_scores`:
  - [ ] `calculation_date` (DATE) for daily snapshots
  - [ ] `raw_points` (NUMERIC) for pre-curve points
  - [ ] `normalized_score` (NUMERIC) for post-curve GPA score
  - [ ] `data_points_count` (INTEGER) for submission count
- [ ] Create `student_category_scores` table
- [ ] Create `student_holistic_gpa` table
- [ ] Add indexing for performance optimization
- [ ] Update foreign key relationships and constraints

### Phase 2: Core Calculation Functions
- [ ] Implement bell curve transformation function `calculate_gpa_from_percentile()` (Supabase MCP)
- [ ] Build subcategory aggregation functions (Supabase MCP):
  - [ ] `aggregate_community_service_points()` - Cap at 12 hours, negative for under 12
  - [ ] `aggregate_attendance_percentage()` for binary attendance (chapel, GBE, fellow friday, community events)
  - [ ] `aggregate_credentials_points()` - Sum of staff-assigned points (no default weight)
  - [ ] `aggregate_performance_ratings()` for quality-based scoring (grades, participation quality)
  - [ ] `aggregate_engagement_scores()` for participation quality (company team-building)
  - [ ] `aggregate_binary_monthly_check()` for small group and dream team (binary, monthly check)
  - [ ] `aggregate_fellow_friday_participation()` - Points-based scoring
  - [ ] `aggregate_job_promotions()` - Staff-assigned points (no default weight)
  - [ ] `aggregate_gbe_participation()` - Attendance + bonus points
- [ ] Create daily calculation orchestrator `run_daily_score_calculation()` (Supabase MCP)
- [ ] Implement category score calculation function (Supabase MCP)
- [ ] Implement holistic GPA calculation function (Supabase MCP)
- [ ] Add audit trail triggers and functions (Supabase MCP)
- [ ] Add comprehensive descriptive comments to all functions
- [ ] Create Python scripts for heavy lifting calculations:
  - [ ] `scripts/daily_score_calculation.py` - Main orchestration script
  - [ ] `scripts/bell_curve_calculator.py` - Bell curve transformation logic
  - [ ] `scripts/subcategory_aggregators.py` - Subcategory-specific calculations
  - [ ] `scripts/score_validator.py` - Score validation and integrity checks
- [ ] Implement batch processing logic for large student populations
- [ ] Set up Python environment with required dependencies (requirements.txt)

### Phase 3: Data Pipeline & Testing
- [ ] Generate comprehensive dummy data for test student `02be2f65-cef3-4b22-823a-4d8e6b8b910b`
- [ ] Create test data across all 17 subcategories:
  - [ ] Spiritual Standing (8 subcategories)
  - [ ] Professional Standing (4 subcategories)
  - [ ] Academic Performance (1 subcategory)
  - [ ] Team Execution (4 subcategories)
- [ ] Run initial scoring calculations
- [ ] Validate bell curve distribution results
- [ ] Test performance with realistic data volumes
- [ ] Create debugging and manual recalculation tools

### Phase 4: Integration & Monitoring
- [ ] Schedule daily calculation job (2 AM daily) using Supabase cron jobs
- [ ] Create webhook endpoint or local script trigger for Python calculations
- [ ] Build monitoring and alerting system for calculation performance
- [ ] Create score validation checks
- [ ] Implement error handling and recovery with retry logic
- [ ] Document scoring methodology
- [ ] Create admin interface for score management
- [ ] Monitor performance and plan migration to AWS Lambda for production
- [ ] Set up dashboards for scoring system health
- [ ] Create Docker container for consistent Python environment

## Implementation Plan

### System Architecture Overview

The Holistic GPA system transforms raw event submission data into academic-style scores using a bell curve distribution. The pipeline processes data daily, applying business rules specific to each subcategory type, then normalizes scores using percentile rankings mapped to a left-weighted normal distribution.

### Data Flow Architecture

1. **Event Submissions** → Raw data in JSONB format
2. **Subcategory Aggregation** → Raw points per student per subcategory
3. **Bell Curve Normalization** → GPA scores (0.0-4.0) using percentile mapping
4. **Category Calculation** → Weighted average of subcategory scores
5. **Holistic GPA** → Average of 4 category scores
6. **Company Standings** → Average of student holistic GPAs

### Bell Curve Algorithm Details

**Target Distribution Parameters:**
- Mean: 3.0 (target average GPA)
- Standard Deviation: 0.6 (prevents extreme outliers)
- Left skew: More students in 2.5-3.5 range than 3.5-4.0
- Range: 0.0 to 4.0

**Implementation Strategy:**
1. Calculate percentile rankings within each subcategory population
2. Map percentiles to GPA values using left-skewed normal distribution
3. Ensure historical consistency with rolling averages
4. Apply caps and minimums for edge cases

### Subcategory Scoring Logic

#### Binary Attendance Types
- **Examples**: Chapel Attendance, Fellow Friday Attendance, GBE Attendance, Company Community Events
- **Scoring**: Count of "present" / Total required attendance
- **Formula**: `(present_count / total_count) * 100`

#### Hours-Based Types with Caps
- **Examples**: Community Service Hours
- **Scoring**: Total hours submitted, capped at 12 hours (standard requirement)
- **Formula**: `LEAST(SUM(hours), 12)` - Negative scoring for under 12 hours
- **Business Rule**: 12 hours is the target, no extra credit for exceeding

#### Performance-Based Types
- **Examples**: Grades (Populi import), Participation Quality
- **Scoring**: Direct grade conversion or 1-10 scale ratings
- **Formula**: Direct value or `(rating / max_rating) * 100`

#### Count-Based Types (Staff-Assigned)
- **Examples**: Credentials, Job Promotions
- **Scoring**: Sum of staff-assigned points (no default weights)
- **Formula**: `SUM(staff_assigned_points)`

#### Engagement-Based Types
- **Examples**: Company Team-Building Participation
- **Scoring**: Quality rating (1-5 scale) assigned by officers
- **Formula**: `average_quality_rating * 20` (convert to 0-100 scale)

#### Binary Monthly Check Types
- **Examples**: Small Group Involvement, Dream Team Leadership
- **Scoring**: Binary participation (present/absent) checked monthly
- **Formula**: `(present_checks / total_checks) * 100`
- **Business Rule**: Monthly check-ins, no role multipliers

#### Points-Based Types
- **Examples**: Fellow Friday Participation
- **Scoring**: Points assigned based on participation quality and duration
- **Formula**: `SUM(participation_points)`

#### Attendance + Bonus Types
- **Examples**: GBE Participation
- **Scoring**: Attendance percentage + bonus points for exceptional participation
- **Formula**: `attendance_percentage + bonus_points`

### Database Schema Details

#### student_subcategory_scores (Renamed from student_scores)
```sql
CREATE TABLE student_subcategory_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  subcategory_id UUID NOT NULL REFERENCES subcategories(id),
  raw_points NUMERIC NOT NULL,           -- Pre-curve aggregated points
  normalized_score NUMERIC NOT NULL,     -- Post-curve GPA score (0.0-4.0)
  academic_year_start INTEGER NOT NULL,
  academic_year_end INTEGER NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  data_points_count INTEGER,             -- Number of submissions included
  total_possible_points NUMERIC,         -- Max possible for comparison
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subcategory_id, calculation_date, academic_year_start)
);
```

#### student_category_scores (New Table)
```sql
CREATE TABLE student_category_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  raw_score NUMERIC NOT NULL,           -- Average of subcategory raw points
  normalized_score NUMERIC NOT NULL,     -- Bell curve GPA score (0.0-4.0)
  academic_year_start INTEGER NOT NULL,
  academic_year_end INTEGER NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subcategory_count INTEGER,            -- Number of subcategories included
  total_possible_points NUMERIC,        -- Max possible for comparison
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, category_id, calculation_date, academic_year_start)
);
```

#### student_holistic_gpa (New Table)
```sql
CREATE TABLE student_holistic_gpa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  holistic_gpa NUMERIC NOT NULL,        -- Average of 4 category scores
  academic_year_start INTEGER NOT NULL,
  academic_year_end INTEGER NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_breakdown JSONB,             -- {spiritual: 3.2, professional: 2.8, ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, calculation_date, academic_year_start)
);
```

### Core Database Functions

#### Bell Curve Transformation
```sql
CREATE OR REPLACE FUNCTION calculate_gpa_from_percentile(percentile NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  -- Left-weighted normal distribution: 3.0 mean, 0.6 std dev
  -- Ensures more students cluster around 2.5-3.5 than extreme ends
  -- 0.8 multiplier creates left skew for more realistic grade distribution
  RETURN GREATEST(0.0, LEAST(4.0,
    3.0 + (0.6 * SQRT(-2 * LN(GREATEST(0.001, percentile))) * 
           COS(2 * PI() * RANDOM()) * 0.8) -- 0.8 creates left skew
  ));
END;
$$ LANGUAGE plpgsql;
```

#### Community Service Aggregation (Capped at 12 hours)
```sql
CREATE OR REPLACE FUNCTION aggregate_community_service_points(
  student_uuid UUID, 
  academic_year_start INT
) RETURNS NUMERIC AS $$
DECLARE
  total_hours NUMERIC := 0;
BEGIN
  -- Sum all community service hours for the academic year
  -- Cap at 12 hours (standard requirement) - no extra credit for exceeding
  -- Negative scoring for students under 12 hours
  SELECT COALESCE(SUM(
    LEAST((submission_data->>'hours')::numeric, 8) -- Daily cap of 8 hours per submission
  ), 0) INTO total_hours
  FROM event_submissions es
  JOIN event_instances ei ON es.event_id = ei.id
  JOIN recurring_events re ON ei.recurring_event_id = re.id
  JOIN subcategories sc ON re.subcategory_id = sc.id
  WHERE es.student_id = student_uuid
    AND sc.name = 'community_service_hours'
    AND EXTRACT(year FROM es.submitted_at) = academic_year_start;
    
  -- Apply 12-hour cap - no extra credit for exceeding standard requirement
  RETURN LEAST(total_hours, 12);
END;
$$ LANGUAGE plpgsql;
```

#### Binary Monthly Check Aggregation
```sql
CREATE OR REPLACE FUNCTION aggregate_binary_monthly_check(
  student_uuid UUID,
  subcategory_name TEXT,
  academic_year_start INT
) RETURNS NUMERIC AS $$
DECLARE
  present_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  -- Count monthly check-ins for small group and dream team involvement
  -- Binary scoring: present/absent for each monthly check
  SELECT 
    COUNT(CASE WHEN submission_data->>'status' = 'present' THEN 1 END),
    COUNT(*)
  INTO present_count, total_count
  FROM event_submissions es
  JOIN event_instances ei ON es.event_id = ei.id
  JOIN recurring_events re ON ei.recurring_event_id = re.id
  JOIN subcategories sc ON re.subcategory_id = sc.id
  WHERE es.student_id = student_uuid
    AND sc.name = subcategory_name
    AND EXTRACT(year FROM es.submitted_at) = academic_year_start;
    
  RETURN CASE 
    WHEN total_count = 0 THEN 0 
    ELSE (present_count::NUMERIC / total_count::NUMERIC) * 100 
  END;
END;
$$ LANGUAGE plpgsql;
```

#### Staff-Assigned Points Aggregation
```sql
CREATE OR REPLACE FUNCTION aggregate_staff_assigned_points(
  student_uuid UUID,
  subcategory_name TEXT,
  academic_year_start INT
) RETURNS NUMERIC AS $$
DECLARE
  total_points NUMERIC := 0;
BEGIN
  -- Sum all staff-assigned points for credentials and job promotions
  -- No default weights - points are assigned by staff members
  SELECT COALESCE(SUM(
    (submission_data->>'assigned_points')::numeric
  ), 0) INTO total_points
  FROM event_submissions es
  JOIN event_instances ei ON es.event_id = ei.id
  JOIN recurring_events re ON ei.recurring_event_id = re.id
  JOIN subcategories sc ON re.subcategory_id = sc.id
  WHERE es.student_id = student_uuid
    AND sc.name = subcategory_name
    AND EXTRACT(year FROM es.submitted_at) = academic_year_start;
    
  RETURN total_points;
END;
$$ LANGUAGE plpgsql;
```

#### Daily Calculation Orchestrator
```sql
CREATE OR REPLACE FUNCTION run_daily_score_calculation()
RETURNS VOID AS $$
DECLARE
  current_academic_year INTEGER := EXTRACT(year FROM CURRENT_DATE);
BEGIN
  -- Step 1: Calculate raw subcategory scores for all students
  -- This processes event submissions and applies business rules per subcategory type
  PERFORM calculate_all_subcategory_scores(current_academic_year);
  
  -- Step 2: Apply bell curve normalization to convert raw points to GPA scores
  -- Uses percentile rankings to ensure fair distribution across student population
  PERFORM apply_bell_curve_to_subcategories(current_academic_year);
  
  -- Step 3: Calculate category scores as weighted averages of subcategory scores
  -- Each category combines its subcategories using defined weighting
  PERFORM calculate_all_category_scores(current_academic_year);
  
  -- Step 4: Calculate holistic GPAs as simple average of 4 category scores
  -- This is the final student score used for company rankings
  PERFORM calculate_all_holistic_gpas(current_academic_year);
  
  -- Step 5: Update company standings based on average student holistic GPAs
  -- Triggers recalculation of competitive rankings
  PERFORM update_all_company_scores(current_academic_year);
END;
$$ LANGUAGE plpgsql;
```

### Test Student Data Plan

**Test Student ID**: `02be2f65-cef3-4b22-823a-4d8e6b8b910b`

#### Comprehensive Event Submissions

**Spiritual Standing (8 subcategories):**
1. **Chapel Attendance**: 25 events, 22 present, 3 absent (88% attendance)
2. **Chapel Participation**: 5 submissions, average 4.2/5 quality
3. **Community Service**: 12 hours across 8 submissions (capped at 12 hours)
4. **Dream Team**: 4 monthly checks, 4 present (100% binary participation)
5. **Fellow Friday Attendance**: 12 events, 11 present, 1 absent (92% attendance)
6. **GBE Attendance**: 8 events, 7 present, 1 absent (88% attendance)
7. **Small Group**: 4 monthly checks, 3 present (75% binary participation)
8. **Spiritual Formation Grade**: 91% (Populi import)

**Professional Standing (4 subcategories):**
1. **Credentials**: 2 certifications with staff-assigned points (150 total points)
2. **Fellow Friday Participation**: 8 sessions, 380 total participation points
3. **Job Promotions**: 1 promotion with staff-assigned points (100 points)
4. **Practicum Grade**: 88% (Populi import)

**Academic Performance (1 subcategory):**
1. **Class Attendance & Grades**: 92% attendance, 86% grade average

**Team Execution (4 subcategories):**
1. **Company Community Events**: 12 events, 10 present (83% attendance)
2. **Company Team-Building**: Officer-rated 4.3/5 participation (86 points)
3. **GBE Participation**: 8 events attended + 20 bonus points (108 total)
4. **Lions Games**: Full participation in 3 sports, 7.5/10 performance

#### Expected Score Calculations

**Raw Score Examples:**
- Chapel Attendance: 22/25 = 88%
- Community Service: 12 hours (capped) = 12 points
- Credentials: Staff-assigned 150 points = 150 points
- Dream Team: 4/4 monthly checks = 100%
- GBE Participation: 88% attendance + 20 bonus = 108 points

**After Bell Curve (Expected ~3.2 GPA for strong performance):**
- Should place in 70th-80th percentile across most categories
- Holistic GPA target: 3.1-3.3 range

### Performance Benchmarks

#### Technical Validation
- Daily calculation completion under 5 minutes for 1000 students
- Bell curve distribution: 68% of students between 2.4-3.6 GPA
- Historical data retention without performance degradation

#### Data Integrity Checks
- All students have scores in all applicable subcategories
- Category scores correctly reflect subcategory averages
- Company standings update automatically with student changes
- Audit trail captures all score modifications

#### Business Logic Validation
- Average holistic GPA maintains 3.0 ± 0.1 over time
- Distribution prevents grade inflation while rewarding excellence
- Left skew encourages improvement without penalizing struggling students
- Company rankings show reasonable separation (not 0.1 GPA differences)

### Relevant Files

#### Planned Database Schema Files (To Be Created via Supabase MCP)
- `migrations/001_create_student_category_scores.sql` - New category scores table (via Supabase MCP)
- `migrations/002_create_student_holistic_gpa.sql` - New holistic GPA table (via Supabase MCP)
- `migrations/003_rename_student_scores.sql` - Rename and update student_scores table (via Supabase MCP)
- `migrations/004_add_scoring_functions.sql` - Core calculation functions (via Supabase MCP)

#### Planned Python Scripts (To Be Created)
- `scripts/daily_score_calculation.py` - Main orchestration script for daily calculations
- `scripts/bell_curve_calculator.py` - Bell curve transformation logic using SciPy
- `scripts/subcategory_aggregators.py` - Subcategory-specific aggregation functions
- `scripts/score_validator.py` - Score validation and integrity checks
- `scripts/generate_dummy_data.py` - Test data generation for student `02be2f65-cef3-4b22-823a-4d8e6b8b910b`
- `requirements.txt` - Python dependencies (pandas, numpy, scipy, supabase, etc.)

#### Planned Testing Files (To Be Created)
- `tests/scoring/` - Scoring system tests
  - `test_bell_curve.py` - Bell curve algorithm tests
  - `test_aggregation.py` - Subcategory aggregation tests
  - `test_integration.py` - End-to-end scoring tests
- `notebooks/` - Jupyter notebooks for algorithm development
  - `bell_curve_development.ipynb` - Bell curve algorithm development
  - `scoring_validation.ipynb` - Score validation and testing

#### Planned Documentation Files (To Be Created)
- `docs/SCORING_METHODOLOGY.md` - Detailed scoring methodology documentation
- `docs/BELL_CURVE_ALGORITHM.md` - Bell curve implementation details
- `docs/SCORING_VALIDATION.md` - Validation and testing procedures
- `docs/PYTHON_SETUP.md` - Python environment setup and deployment

### Architecture Considerations

#### Heavy Lifting Functions - Python Scripts Approach

**Development Phase: Local Python Scripts**
- **Pros**: 
  - Better mathematical libraries (NumPy, SciPy, Pandas)
  - Easier to test and debug locally
  - More flexible for complex calculations
  - Better performance for data processing
  - Can use Jupyter notebooks for development
- **Cons**: 
  - Need to handle Supabase integration
  - Manual deployment process initially

**Production Phase: AWS Lambda with Python**
- **Pros**:
  - Same Python codebase as development
  - Scalable and cost-effective
  - Can handle large datasets efficiently
  - Easy migration from local scripts
- **Cons**:
  - Additional infrastructure to manage
  - Need to handle authentication and database connections

**Recommended Approach:**
1. **Start with local Python scripts** for development and testing
2. **Use Supabase cron jobs** to trigger local scripts (or webhook endpoints)
3. **Test thoroughly** with realistic data volumes
4. **Migrate to AWS Lambda** for production deployment
5. **Maintain same Python codebase** across environments

#### Integration Strategy

**Development: Supabase Cron Job → Local Python Script → Database Updates**

```python
# Local Python script approach (development)
# scripts/daily_score_calculation.py
import asyncio
import pandas as pd
import numpy as np
from supabase import create_client, Client

async def calculate_daily_scores():
    # Initialize Supabase client
    supabase: Client = create_client(url, key)
    
    # Get all students for current academic year
    current_year = datetime.now().year
    students = supabase.table('students').select('id, academic_year_start').eq('academic_year_start', current_year).execute()
    
    # Process in batches
    batch_size = 100
    for i in range(0, len(students.data), batch_size):
        batch = students.data[i:i+batch_size]
        await process_student_batch(batch, supabase)
        
    print(f"Processed {len(students.data)} students")

async def process_student_batch(students, supabase):
    # Calculate scores for each student in batch
    for student in students:
        await calculate_student_scores(student['id'], supabase)

if __name__ == "__main__":
    asyncio.run(calculate_daily_scores())
```

**Production: Supabase Cron Job → AWS Lambda → Database Updates**
```python
# AWS Lambda approach (production)
# services/lambdas/score-calculation/src/handler.py
import json
import pandas as pd
import numpy as np
from supabase import create_client, Client

def lambda_handler(event, context):
    # Same calculation logic as local script
    academic_year = event.get('academic_year', datetime.now().year)
    batch_size = event.get('batch_size', 100)
    
    # Initialize Supabase client
    supabase: Client = create_client(url, key)
    
    # Process scoring calculations
    results = calculate_scores_for_year(academic_year, batch_size, supabase)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'success': True,
            'processed': len(results)
        })
    }
```

#### Python Libraries and Dependencies

**Required Python Packages:**
```python
# requirements.txt
supabase==2.0.0
pandas==2.1.0
numpy==1.24.0
scipy==1.11.0
asyncio
python-dotenv==1.0.0
pydantic==2.4.0
```

**Key Mathematical Operations:**
- **Bell Curve Calculations**: SciPy for statistical distributions
- **Data Processing**: Pandas for efficient data manipulation
- **Numerical Operations**: NumPy for fast array operations
- **Data Validation**: Pydantic for type safety

#### Performance Considerations

**Batch Processing Strategy:**
- Process students in batches of 100-200 for optimal performance
- Use pandas DataFrames for efficient data manipulation
- Implement async processing for database operations
- Store intermediate results to resume from failures

**Development Workflow:**
- Use Jupyter notebooks for algorithm development and testing
- Local Python scripts for integration testing
- Docker containers for consistent environments
- Version control for all Python code

### Environment Configuration

#### Required Environment Variables
```bash
# Scoring System Configuration
SCORING_BELL_CURVE_MEAN=3.0
SCORING_BELL_CURVE_STD_DEV=0.6
SCORING_BELL_CURVE_SKEW=0.8
SCORING_DAILY_CALCULATION_TIME=02:00
SCORING_MAX_DAILY_HOURS=8
SCORING_COMMUNITY_SERVICE_CAP=12
```

#### Database Configuration
- Configure appropriate indexes for scoring queries
- Set up automated backup for scoring data
- Configure monitoring for calculation job performance

### Success Metrics

#### Technical Success
- [ ] Daily calculations complete within 5 minutes
- [ ] Bell curve distribution maintains 3.0 ± 0.1 average
- [ ] All students have complete score records
- [ ] Historical data accessible and performant

#### Business Success
- [ ] Student engagement increases with competitive scoring
- [ ] Company rankings show meaningful differentiation
- [ ] Score trends reflect student development progress
- [ ] System supports data-driven decision making

#### User Experience Success
- [ ] Students can view their holistic GPA breakdown
- [ ] Officers can track company performance
- [ ] Staff can manage and adjust scoring parameters
- [ ] Historical trends are easily accessible
