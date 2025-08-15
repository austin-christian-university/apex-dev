# ACU Blueprint Holistic GPA Scoring System - Python

This directory contains the Python implementation of the ACU Blueprint Holistic GPA Scoring System. The system processes event submissions, applies business logic, and calculates holistic GPAs using a bell curve distribution.

## 🏗️ Architecture

```
Event Submissions → Python Aggregators → Bell Curve → Holistic GPA → Database Updates
     (Raw Data)        (Business Logic)   (3.0 Mean)    (Final Score)   (Real-time)
```

## 📁 Project Structure

```
scripts/python/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Container configuration
├── docker-compose.yml          # Local development setup
├── aws-deploy.sh               # AWS Lambda deployment script
├── env.example                 # Environment configuration template
├── daily_score_calculation.py  # Main orchestration script
├── bell_curve_calculator.py    # Bell curve transformation logic
├── subcategory_aggregators.py  # Business logic for subcategories
├── score_validator.py          # Score validation and integrity checks
└── generate_dummy_data.py      # Test data generation

# nbdev (Notebook-driven development)
├── settings.ini                # nbdev config (lib_path=nbs export target: apex_scoring)
├── nbs/                        # Development notebooks (source of truth)
│   └── README.md               # How to work with nbdev notebooks
└── apex_scoring/               # Exported library modules (imported by runtime)
    ├── __init__.py
    ├── bell_curve.py           # Facade → existing bell_curve_calculator
    ├── aggregators.py          # Facade → existing subcategory_aggregators
    ├── company_scores.py       # Facade → existing company_score_calculator
    └── validator.py            # Facade → existing score_validator
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Docker (optional, for containerized development)
- AWS CLI (for production deployment)
- Supabase project with service role key

### Local Development Setup

1. **Clone and navigate to the Python directory:**
   ```bash
   cd scripts/python
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run the scoring system:**
   ```bash
   python daily_score_calculation.py
   ```

## 🧠 Notebook-driven Development with nbdev

We use nbdev to keep notebooks as the authoring surface while exporting production code into `apex_scoring/*` modules used by CLI and Lambda.

### Setup
```bash
cd scripts/python
pip install -r requirements.txt
nbdev_install_hooks
```

Open notebooks and iterate:
```bash
jupyter notebook nbs
# Edit code cells marked with `#| export`
nbdev_export  # write exported modules to apex_scoring/
```

Use the exported library from any script:
```python
from apex_scoring.bell_curve import BellCurveCalculator
```

### Why this matters
- No copy/paste from notebooks to scripts
- AWS Lambda and CLI import the same exported modules
- Git-friendly notebook diffs via nbdev hooks

### Docker Development

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run Jupyter notebook for development:**
   ```bash
   docker-compose --profile development up jupyter
   # Access at http://localhost:8888
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Required: Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Environment Settings
ENVIRONMENT=development
LOG_LEVEL=INFO

# Scoring System Configuration
SCORING_BELL_CURVE_MEAN=3.0
SCORING_BELL_CURVE_STD_DEV=0.6
SCORING_COMMUNITY_SERVICE_CAP=12
```

### Business Logic Configuration

The scoring system implements specific business rules:

- **Community Service**: Capped at 12 hours per academic year
- **Binary Attendance**: Percentage-based scoring (present/total)
- **Staff-Assigned Points**: Direct point values from staff
- **Performance Ratings**: Quality-based scoring (1-10 scale)
- **Monthly Checks**: Binary participation tracking

## 📊 Usage Examples

### Run Daily Score Calculation

```python
from daily_score_calculation import calculate_daily_scores

# Calculate scores for current academic year
await calculate_daily_scores(academic_year=2025)
```

### Generate Test Data

```python
from generate_dummy_data import generate_student_data

# Generate test data for a specific student
await generate_student_data(student_id="02be2f65-cef3-4b22-823a-4d8e6b8b910b")
```

### Validate Scores

```python
from score_validator import validate_scoring_system

# Run comprehensive validation
results = await validate_scoring_system(academic_year=2025)
print(results)
```

## 🚀 Production Deployment

### AWS Lambda Deployment

1. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

2. **Deploy to Lambda:**
   ```bash
   ./aws-deploy.sh
   ```

The handler is `daily_score_calculation.lambda_handler`, which reuses the same orchestrator used locally.

3. **Set up Supabase cron job:**
   ```sql
   -- Create cron job to trigger Lambda function daily at 2 AM
   SELECT cron.schedule(
     'daily-scoring-calculation',
     '0 2 * * *',
     'SELECT net.http_post(
       url:=''https://your-lambda-url'',
       headers:=''{"Content-Type": "application/json"}'',
       body:=''{"academic_year": 2025}''
     );'
   );
   ```

### Docker Production

1. **Build production image:**
   ```bash
   docker build -t apex-scoring-system .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -d \
     --name apex-scoring \
     -e SUPABASE_URL=$SUPABASE_URL \
     -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
     apex-scoring-system
   ```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest test_bell_curve.py

# Run with coverage
pytest --cov=. --cov-report=html
```

### Manual Testing

```bash
# Test bell curve calculation
python -c "from bell_curve_calculator import calculate_gpa_from_percentile; print(calculate_gpa_from_percentile(0.5))"

# Test subcategory aggregation
python -c "from subcategory_aggregators import SubcategoryAggregator; print('Aggregator ready')"
```

## 📈 Monitoring

### Logs

The system uses structured logging with `structlog`:

```python
import logging
import structlog

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

### Health Checks

```bash
# Check system health
curl -X POST http://localhost:8000/health

# Check scoring system status
python -c "from daily_score_calculation import check_system_health; print(check_system_health())"
```

## 🔄 Development Workflow

### 1. Local Development

```bash
# Start development environment
cd scripts/python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run scoring system
python daily_score_calculation.py
```

### 2. Testing Changes

```bash
# Run tests
pytest

# Generate test data
python generate_dummy_data.py

# Validate results
python score_validator.py
```

### 3. Production Deployment

```bash
# Deploy to AWS Lambda
./aws-deploy.sh

# Or deploy with Docker
docker build -t apex-scoring-system .
docker push your-registry/apex-scoring-system
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error:**
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
   - Check network connectivity

2. **Python Dependencies:**
   - Ensure Python 3.11+ is installed
   - Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

3. **Docker Issues:**
   - Check Docker is running: `docker info`
   - Rebuild image: `docker-compose build --no-cache`

4. **AWS Deployment:**
   - Verify AWS credentials: `aws sts get-caller-identity`
   - Check IAM permissions for Lambda deployment

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python daily_score_calculation.py
```

## 📚 API Reference

### Core Functions

- `calculate_daily_scores(academic_year: int)` - Main orchestration function
- `aggregate_community_service_hours(student_id: str, academic_year: int)` - Community service aggregation
- `calculate_gpa_from_percentile(percentile: float)` - Bell curve transformation
- `validate_scoring_system(academic_year: int)` - System validation

### Data Models

- `StudentScore` - Individual student score record
- `SubcategoryScore` - Subcategory-level scoring
- `CategoryScore` - Category-level aggregation
- `HolisticGPA` - Final GPA calculation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the ACU Blueprint Student Development Platform.
