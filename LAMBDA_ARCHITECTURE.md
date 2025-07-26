# Lambda-Based Architecture Guide

## 🏗️ Architecture Overview

Your monorepo now uses **AWS Lambda functions** for all backend logic, which is the correct approach for a serverless architecture. Here's what changed and why:

## ❌ What Was Removed (Express APIs)

I initially created Express.js APIs in `services/students-api/` because I misunderstood your requirements. **Express APIs are traditional servers that run continuously**, which is not what you want.

**Express APIs are:**
- Always running (24/7)
- Need server management
- More expensive for low traffic
- Traditional server architecture

## ✅ What's Now in Place (Lambda Functions)

### Lambda Functions Structure
```
services/
└── lambdas/
    ├── students-api/           # Students management
    │   ├── src/
    │   │   └── handlers/       # Individual Lambda functions
    │   │       ├── getStudents.ts
    │   │       ├── getStudent.ts
    │   │       ├── createStudent.ts
    │   │       ├── updateStudent.ts
    │   │       └── deleteStudent.ts
    │   ├── package.json
    │   ├── serverless.yml      # Deployment configuration
    │   └── tsconfig.json
    │
    ├── auth-api/               # Future: Authentication
    └── scores-api/             # Future: Score calculations
```

### Lambda Functions Benefits
- **Serverless**: Only run when called
- **Pay-per-use**: Only pay for actual execution time
- **Auto-scaling**: Automatically handle traffic spikes
- **No server management**: AWS handles infrastructure
- **Cost-effective**: Perfect for variable workloads

## 🔄 Migration from Next.js API Routes

### Before (Next.js API Routes)
```typescript
// apps/web/app/api/students/route.ts
export async function GET() {
  // Handle request
  return NextResponse.json(students)
}
```

### After (Lambda Functions)
```typescript
// services/lambdas/students-api/src/handlers/getStudents.ts
export const handler = async (event: APIGatewayProxyEvent) => {
  // Handle request
  return {
    statusCode: 200,
    body: JSON.stringify({ data: students })
  }
}
```

## 🚀 How to Use Lambda Functions

### Development
```bash
# Start Lambda functions locally
cd services/lambdas/students-api
pnpm dev  # Uses serverless-offline

# This starts the Lambda functions on localhost:3001
```

### Deployment
```bash
# Deploy to AWS
cd services/lambdas/students-api
pnpm deploy

# This deploys to AWS Lambda + API Gateway
```

### API Endpoints
After deployment, your Lambda functions will be available at:
- `https://your-api-gateway-url/dev/students` (GET)
- `https://your-api-gateway-url/dev/students/{id}` (GET)
- `https://your-api-gateway-url/dev/students` (POST)
- `https://your-api-gateway-url/dev/students/{id}` (PUT)
- `https://your-api-gateway-url/dev/students/{id}` (DELETE)

## 🔧 Configuration Files

### serverless.yml
- Defines Lambda functions
- Sets up API Gateway routes
- Configures IAM permissions
- Sets environment variables

### package.json
- Lambda-specific dependencies
- Build and deployment scripts
- Workspace dependencies for shared code

## 📦 Shared Code Usage

Lambda functions can use your shared packages:

```typescript
// In Lambda handlers
import type { Student, ApiResponse } from '@acu-apex/types'
import { formatDate, calculateAverageScore } from '@acu-apex/utils'
```

## 🎯 Next Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Test Lambda Functions Locally**
   ```bash
   cd services/lambdas/students-api
   pnpm dev
   ```

3. **Update Web App API Calls**
   - Change from `/api/students` to `http://localhost:3001/dev/students`
   - Use environment variables for different stages

4. **Deploy to AWS**
   ```bash
   cd services/lambdas/students-api
   pnpm deploy
   ```

## 🔍 Key Differences Summary

| Aspect | Next.js API Routes | Lambda Functions |
|--------|-------------------|------------------|
| **Runtime** | Vercel/Netlify | AWS Lambda |
| **Cost** | Per request + hosting | Pay-per-use |
| **Scaling** | Automatic | Automatic |
| **Cold Start** | Minimal | Yes (but manageable) |
| **Deployment** | Git-based | Serverless Framework |
| **Database** | File-based (JSON) | DynamoDB (recommended) |

## 🛠️ Tools Used

- **Serverless Framework**: Deployment and local development
- **AWS Lambda**: Serverless compute
- **API Gateway**: HTTP endpoints
- **DynamoDB**: NoSQL database (recommended)
- **TypeScript**: Type safety

This architecture is much more scalable and cost-effective for your use case! 