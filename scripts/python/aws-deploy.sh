#!/bin/bash
# ACU Apex Holistic GPA Scoring System - AWS Lambda Deployment Script
# This script packages and deploys the Python scoring system to AWS Lambda

set -e

# Configuration
FUNCTION_NAME="apex-scoring-system"
REGION="${AWS_REGION:-us-east-1}"
RUNTIME="python3.11"
HANDLER="daily_score_calculation.lambda_handler"
TIMEOUT=300
MEMORY_SIZE=512

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying ACU Apex Scoring System to AWS Lambda${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TEMP_DIR/package"

# Copy source code
cp -r . "$PACKAGE_DIR/"

# Install dependencies in the package directory
cd "$PACKAGE_DIR"
pip install -r requirements.txt -t .

# Remove unnecessary files
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.pyc" -delete 2>/dev/null || true
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true

# Create ZIP file
ZIP_FILE="$TEMP_DIR/function.zip"
zip -r "$ZIP_FILE" . -x "*.git*" "*.env*" "*.pyc" "__pycache__/*" ".pytest_cache/*"

echo -e "${GREEN}✅ Deployment package created: $ZIP_FILE${NC}"

# Deploy to AWS Lambda
echo -e "${YELLOW}🚀 Deploying to AWS Lambda...${NC}"

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo -e "${YELLOW}📝 Updating existing function...${NC}"
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$REGION"
    
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --timeout "$TIMEOUT" \
        --memory-size "$MEMORY_SIZE" \
        --region "$REGION"
else
    echo -e "${YELLOW}🆕 Creating new function...${NC}"
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime "$RUNTIME" \
        --handler "$HANDLER" \
        --timeout "$TIMEOUT" \
        --memory-size "$MEMORY_SIZE" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$REGION" \
        --role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role"
fi

# Clean up
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 Function ARN: arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME${NC}"
echo -e "${YELLOW}🔗 Console URL: https://console.aws.amazon.com/lambda/home?region=$REGION#/functions/$FUNCTION_NAME${NC}"
