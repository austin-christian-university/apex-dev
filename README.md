# ACU Apex App Monorepo

A monorepo containing the ACU Apex application ecosystem with web, mobile, and backend services.

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
├── tools/                       # Build tools and scripts
├── package.json                 # Root package.json
├── turbo.json                   # Turborepo configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
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

# Mobile app only
pnpm --filter @acu-apex/mobile start

# Students Lambda API only
pnpm --filter @acu-apex/students-lambda dev
```

#### Build all applications
```bash
pnpm build
```

#### Type checking
```bash
pnpm type-check
```

#### Linting
```bash
pnpm lint
```

## 📱 Applications

### Web App (`apps/web`)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Port**: 3000

### Mobile App (`apps/mobile`)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Status**: In development

### Backend Services

#### Students API (`services/lambdas/students-api`)
- **Framework**: AWS Lambda + API Gateway
- **Runtime**: Node.js 18.x
- **Features**:
  - CRUD operations for students
  - DynamoDB integration
  - Data validation with Zod
  - Serverless deployment

#### Future Lambda Services
- **Auth API**: Authentication and authorization
- **Scores API**: Advanced score calculations and analytics

## 📦 Packages

### UI Package (`packages/ui`)
Shared React components built with Radix UI primitives and Tailwind CSS.

```typescript
import { Button, Card, Input } from '@acu-apex/ui'
```

### Utils Package (`packages/utils`)
Shared utility functions for common operations.

```typescript
import { cn, formatDate, calculateAverageScore } from '@acu-apex/utils'
```

### Types Package (`packages/types`)
Shared TypeScript type definitions.

```typescript
import type { Student, Score, ApiResponse } from '@acu-apex/types'
```

### Config Package (`packages/config`)
Shared configurations for ESLint, TypeScript, and Tailwind CSS.

## 🔧 Development Workflow

### Adding a New Package
1. Create the package directory in `packages/`
2. Add `package.json` with workspace dependencies
3. Create TypeScript configuration
4. Export from the package's `src/index.ts`
5. Add to workspace dependencies in consuming packages

### Adding a New Service
1. Create the service directory in `services/`
2. Set up Express.js or other framework
3. Add health check endpoint
4. Configure CORS and security middleware
5. Add to Turborepo pipeline

### Code Quality
- **ESLint**: Shared configuration in `packages/config/eslint`
- **TypeScript**: Strict configuration with shared types
- **Prettier**: Code formatting
- **Turborepo**: Build caching and task orchestration

## 🚀 Deployment

### Web App
- **Platform**: Vercel (recommended) or Netlify
- **Build Command**: `pnpm build`
- **Output Directory**: `apps/web/.next`

### Mobile App
- **Platform**: Expo Application Services (EAS)
- **Build Command**: `pnpm build`
- **Distribution**: App Store / Google Play Store

### Backend Services
- **Platform**: AWS Lambda + API Gateway
- **Build Command**: `pnpm build`
- **Deploy Command**: `pnpm deploy`

## 📊 Monitoring & Analytics

- **Health Checks**: `/health` endpoints on all services
- **Logging**: Structured logging with Morgan
- **Error Handling**: Centralized error responses
- **Performance**: Turborepo build caching

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For questions or issues, please contact the development team. 