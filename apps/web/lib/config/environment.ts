/**
 * Environment configuration utility for the APEX application
 * Centralizes all environment variable access and validation
 */

export const environment = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isPreview: process.env.VERCEL_ENV === 'preview',
  
  // Current environment name
  env: process.env.NODE_ENV || 'development',
  
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // Site URLs
  urls: {
    site: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    app: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Authentication (NextAuth)
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // Microsoft OAuth
  microsoft: {
    clientId: process.env.AZURE_AD_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    tenantId: process.env.AZURE_AD_TENANT_ID!,
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL,
  },
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'AZURE_AD_TENANT_ID',
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file or environment configuration.'
    )
  }
  
  // Validate URL formats
  try {
    new URL(environment.supabase.url)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }
  
  try {
    new URL(environment.urls.site)
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a valid URL')
  }
}

/**
 * Gets environment-specific configuration values
 */
export function getEnvironmentConfig() {
  return {
    environment: environment.env,
    isDev: environment.isDevelopment,
    isProd: environment.isProduction,
    isPreview: environment.isPreview,
    supabaseUrl: environment.supabase.url,
    siteUrl: environment.urls.site,
    appUrl: environment.urls.app,
  }
}

/**
 * Logs environment information (safe for production)
 */
export function logEnvironmentInfo() {
  if (environment.isDevelopment) {
    console.log('🌍 Environment Configuration:')
    console.log(`  - Environment: ${environment.env}`)
    console.log(`  - Supabase URL: ${environment.supabase.url}`)
    console.log(`  - Site URL: ${environment.urls.site}`)
    console.log(`  - Is Preview: ${environment.isPreview}`)
  }
}

// Validate environment on import in production
if (environment.isProduction) {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    // Don't throw in production to avoid breaking the app
    // Instead, log the error and continue with defaults
  }
}

// Log environment info in development
if (environment.isDevelopment) {
  logEnvironmentInfo()
}
