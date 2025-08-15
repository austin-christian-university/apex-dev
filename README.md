# ACU Blueprint App Monorepo

A monorepo containing the ACU Blueprint application ecosystem with web, mobile, backend services, and Python scoring system.

## 🏗️ Project Structure

```
acu-apex-app-monorepo/
├── apps/
│   ├── web/                     # Next.js web application
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # Web-specific components
│   │   ├── lib/                 # Web-specific utilities
│   │   ├── public/              # Static assets
│   │   └── package.json
│   │
│   └── mobile/                  # React Native mobile application (Expo)
│       ├── src/                 # Mobile app source code
│       ├── assets/              # Mobile assets
│       ├── package.json
│       └── app.json
│
├── packages/
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   ├── ui/              # Radix UI components
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                   # Shared utility functions
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                   # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                  # Shared configurations
│       ├── eslint/
│       ├── typescript/
│       ├── tailwind/
│       └── package.json
│
├── services/
│   ├── lambdas/
│   │   ├── students-api/        # Students management Lambda functions
│   │   │   ├── src/
│   │   │   │   └── handlers/
│   │   │   ├── package.json
│   │   │   └── serverless.yml
│   │   │
│   │   ├── auth-api/            # Authentication Lambda functions (future)
│   │   └── scores-api/          # Scores management Lambda functions (future)
│
├── scripts/
│   ├── python/                  # 🐍 Python Scoring System
│   │   ├── daily_score_calculation.py    # Main orchestration
│   │   ├── bell_curve_calculator.py      # Bell curve logic
│   │   ├── subcategory_aggregators.py    # Business logic
│   │   ├── score_validator.py            # Validation
│   │   ├── generate_dummy_data.py        # Test data
│   │   ├── requirements.txt              # Python dependencies
│   │   ├── Dockerfile                    # Container config
│   │   ├── docker-compose.yml           # Local development
│   │   ├── aws-deploy.sh                # AWS Lambda deployment
│   │   └── README.md                    # Python system docs
│   │
│   └── [TypeScript scripts]     # TypeScript utilities
│
├── tools/                       # Build tools and scripts
├── package.json                 # Root package.json
├── turbo.json                   # Turborepo configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Python 3.11+ (for scoring system)
- Docker (optional, for containerized development)
- AWS CLI (for production deployment)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd acu-apex-app-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

### Development

#### Start all applications in development mode
```bash
pnpm dev
```

#### Start specific applications
```bash
# Web app only
pnpm --filter @acu-apex/web dev
```

## 🐍 Python Scoring System

The ACU Blueprint Holistic GPA Scoring System is implemented in Python and processes event submissions to calculate student holistic GPAs using a bell curve distribution.

### Quick Start (Python)

1. **Navigate to Python directory:**
   ```bash
   cd scripts/python
   ```

2. **Set up Python environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run scoring system:**
   ```bash
   python daily_score_calculation.py
   ```

### Docker Development

```bash
# Build and run with Docker Compose
cd scripts/python
docker-compose up --build

# Run Jupyter notebook for development
docker-compose --profile development up jupyter
# Access at http://localhost:8888
```

### Production Deployment

```bash
# Deploy to AWS Lambda
cd scripts/python
./aws-deploy.sh

# Or deploy with Docker
docker build -t apex-scoring-system .
docker run -d \
  --name apex-scoring \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  apex-scoring-system
```

### Key Features

- **Bell Curve Distribution**: 3.0 mean GPA with left-weighted distribution
- **Business Logic**: Community service caps, attendance tracking, staff-assigned points
- **Real-time Processing**: Direct database updates with service role key
- **Scalable Architecture**: Ready for AWS Lambda deployment
- **Comprehensive Testing**: Validation and integrity checks

### Documentation

For detailed Python system documentation, see [`scripts/python/README.md`](scripts/python/README.md).

## 🏗️ Architecture Overview

### Scoring System Flow

```
Event Submissions → Python Aggregators → Bell Curve → Holistic GPA → Database Updates
     (Raw Data)        (Business Logic)   (3.0 Mean)    (Final Score)   (Real-time)
```

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Scoring System**: Python 3.11, Pandas, NumPy, SciPy
- **Deployment**: AWS Lambda, Docker, Vercel
- **Mobile**: React Native, Expo

## 📚 Documentation

- [Python Scoring System](scripts/python/README.md) - Comprehensive Python system docs
- [Database Schema](docs/DATABASE_SCHEMA_PLANNING.md) - Database design and planning
- [Student App Context](docs/STUDENT_APP_CONTEXT.md) - Student development platform overview
- [Scoring System](docs/scoring_system.md) - Scoring methodology and implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the ACU Blueprint Student Development Platform. 