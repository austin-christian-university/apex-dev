# Deployment Guide

This guide explains how to deploy your APEX application with separate development and production environments.

## Environment Setup Overview

The application now uses a centralized environment configuration system that automatically detects the current environment and uses the appropriate settings.

### Environment Detection

- **Development**: `NODE_ENV=development` (local development)
- **Preview**: `VERCEL_ENV=preview` (Vercel preview deployments)
- **Production**: `NODE_ENV=production` (Vercel production deployments)

## Local Development Setup

1. **Copy environment template:**
   ```bash
   cp env.template apps/web/.env.local
   ```

2. **Fill in your development values:**
   ```bash
   # Edit apps/web/.env.local with your development Supabase project details
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
   # ... other values
   ```

3. **Validate your environment:**
   ```bash
   cd apps/web
   pnpm env:check
   ```

## Supabase Project Setup

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project for production
3. Note down the new project reference, URL, and API keys

### 2. Clone Database Schema

```bash
# Link to your development project
supabase link --project-ref your-dev-project-ref

# Dump the schema
supabase db dump > dev-schema.sql

# Create new production project in dashboard, then link to it
supabase link --project-ref your-new-prod-project-ref

# Apply the schema to production
supabase db push --schema-file dev-schema.sql
```

### 3. Copy Data (Optional)

If you need to copy data from development to production:

```bash
# Dump data from development
supabase db dump --data-only > dev-data.sql

# Apply to production
supabase db push --data-file dev-data.sql
```

## Vercel Deployment Setup

### 1. Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

#### Preview Environment (Development)
- `NEXT_PUBLIC_SUPABASE_URL` = your-dev-supabase-url
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-dev-supabase-anon-key
- `SUPABASE_SERVICE_ROLE_KEY` = your-dev-supabase-service-role-key
- `NEXTAUTH_SECRET` = your-nextauth-secret
- `AZURE_AD_CLIENT_ID` = your-azure-client-id
- `AZURE_AD_CLIENT_SECRET` = your-azure-client-secret
- `AZURE_AD_TENANT_ID` = your-azure-tenant-id
- `NEXT_PUBLIC_SITE_URL` = https://your-preview-domain.vercel.app
- `NEXT_PUBLIC_APP_URL` = https://your-preview-domain.vercel.app

#### Production Environment
- `NEXT_PUBLIC_SUPABASE_URL` = your-prod-supabase-url
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your-prod-supabase-anon-key
- `SUPABASE_SERVICE_ROLE_KEY` = your-prod-supabase-service-role-key
- `NEXTAUTH_SECRET` = your-nextauth-secret (can be the same or different)
- `AZURE_AD_CLIENT_ID` = your-azure-client-id
- `AZURE_AD_CLIENT_SECRET` = your-azure-client-secret
- `AZURE_AD_TENANT_ID` = your-azure-tenant-id
- `NEXT_PUBLIC_SITE_URL` = https://your-production-domain.com
- `NEXT_PUBLIC_APP_URL` = https://your-production-domain.com

### 2. Deployment Configuration

The `vercel.json` file is already configured for your monorepo structure. It will:
- Build from the `apps/web` directory
- Use the correct output directory
- Set appropriate function timeouts
- Configure regions and other optimizations

### 3. Deploy

```bash
# Deploy to preview (development environment)
git push origin feature-branch

# Deploy to production
git push origin main
```

## Environment Validation

The application includes built-in environment validation:

### During Development
```bash
cd apps/web
pnpm env:check    # Validate environment
pnpm env:debug    # Debug environment values
```

### During Runtime
- Environment validation runs automatically in production
- Errors are logged but won't crash the application
- Development mode shows detailed environment information in console

## Troubleshooting

### Common Issues

1. **"Missing required environment variables" error**
   - Check that all required variables are set in Vercel
   - Verify variable names match exactly (case-sensitive)

2. **"Invalid URL" errors**
   - Ensure URLs start with `https://` (or `http://` for local)
   - Check for typos in Supabase URLs

3. **Authentication issues**
   - Verify Azure AD configuration
   - Check that redirect URLs match your domains

### Debug Commands

```bash
# Check environment health
pnpm env:check

# View current configuration (development only)
pnpm env:debug

# Type check
pnpm type-check

# Lint check
pnpm lint
```

## Security Notes

- Never commit `.env.local` or any `.env` files to git
- Use different `NEXTAUTH_SECRET` values for different environments
- Rotate API keys regularly
- Use Row Level Security (RLS) in Supabase for all tables

## Environment File Structure

```
apps/web/
├── .env.local          # Local development (gitignored)
├── .env.example        # Example file (optional)
└── lib/config/
    ├── environment.ts  # Environment configuration
    └── env-helper.ts   # Environment utilities
```

## Next Steps

1. Set up your production Supabase project
2. Configure Vercel environment variables
3. Test preview deployments
4. Deploy to production
5. Set up monitoring and error tracking

For more help, check the environment utilities in `apps/web/lib/config/`.
