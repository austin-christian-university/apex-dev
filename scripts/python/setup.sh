#!/bin/bash
# ACU Blueprint Python Scoring System - Setup Script
# This script sets up the Python environment for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐍 Setting up ACU Blueprint Python Scoring System${NC}"

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.11+ first.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
REQUIRED_VERSION="3.11"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Python version $PYTHON_VERSION is too old. Please install Python 3.11+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python $PYTHON_VERSION detected${NC}"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}⬆️  Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env file created. Please edit it with your Supabase credentials.${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create logs directory
if [ ! -d "logs" ]; then
    echo -e "${YELLOW}📁 Creating logs directory...${NC}"
    mkdir -p logs
    echo -e "${GREEN}✅ Logs directory created${NC}"
fi

# Create notebooks directory for Jupyter
if [ ! -d "notebooks" ]; then
    echo -e "${YELLOW}📓 Creating notebooks directory...${NC}"
    mkdir -p notebooks
    echo -e "${GREEN}✅ Notebooks directory created${NC}"
fi

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. Edit .env file with your Supabase credentials"
echo -e "  2. Activate virtual environment: ${YELLOW}source venv/bin/activate${NC}"
echo -e "  3. Run scoring system: ${YELLOW}python daily_score_calculation.py${NC}"
echo -e "  4. Or start with Docker: ${YELLOW}docker-compose up --build${NC}"
echo -e ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  - Python system: ${YELLOW}README.md${NC}"
echo -e "  - Main project: ${YELLOW}../../README.md${NC}"
