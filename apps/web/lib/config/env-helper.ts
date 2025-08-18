/**
 * Environment configuration helper utilities
 * Provides debugging and configuration assistance
 */

import { environment, getEnvironmentConfig } from './environment'

/**
 * Prints current environment configuration (safe for development)
 */
export function debugEnvironment() {
  if (!environment.isDevelopment) {
    console.warn('debugEnvironment() should only be used in development')
    return
  }

  const config = getEnvironmentConfig()
  
  console.group('🔧 Environment Configuration Debug')
  console.log('Environment:', config.environment)
  console.log('Is Development:', config.isDev)
  console.log('Is Production:', config.isProd)
  console.log('Is Preview:', config.isPreview)
  console.log('Supabase URL:', config.supabaseUrl)
  console.log('Site URL:', config.siteUrl)
  console.log('App URL:', config.appUrl)
  console.groupEnd()
}

/**
 * Checks if environment is properly configured
 */
export function checkEnvironmentHealth(): {
  isHealthy: boolean
  issues: string[]
  warnings: string[]
} {
  const issues: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  if (!environment.supabase.url) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is missing')
  }

  if (!environment.supabase.anonKey) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  }

  if (!environment.supabase.serviceRoleKey) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing (required for admin operations)')
  }

  if (!environment.auth.secret) {
    issues.push('NEXTAUTH_SECRET is missing')
  }

  if (!environment.microsoft.clientId) {
    issues.push('AZURE_AD_CLIENT_ID is missing')
  }

  if (!environment.microsoft.clientSecret) {
    issues.push('AZURE_AD_CLIENT_SECRET is missing')
  }

  if (!environment.microsoft.tenantId) {
    issues.push('AZURE_AD_TENANT_ID is missing')
  }

  // Check URL formats
  try {
    new URL(environment.supabase.url)
  } catch {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
  }

  try {
    new URL(environment.urls.site)
  } catch {
    issues.push('NEXT_PUBLIC_SITE_URL is not a valid URL')
  }

  try {
    new URL(environment.urls.app)
  } catch {
    issues.push('NEXT_PUBLIC_APP_URL is not a valid URL')
  }

  // Environment-specific checks
  if (environment.isProduction) {
    if (environment.urls.site.includes('localhost')) {
      warnings.push('Site URL contains localhost in production')
    }
    
    if (environment.urls.app.includes('localhost')) {
      warnings.push('App URL contains localhost in production')
    }
  }

  return {
    isHealthy: issues.length === 0,
    issues,
    warnings,
  }
}

/**
 * Validates environment and logs results
 */
export function validateAndLogEnvironment() {
  const health = checkEnvironmentHealth()
  
  if (health.isHealthy) {
    console.log('✅ Environment configuration is healthy')
  } else {
    console.error('❌ Environment configuration has issues:')
    health.issues.forEach(issue => console.error(`  - ${issue}`))
  }

  if (health.warnings.length > 0) {
    console.warn('⚠️ Environment configuration warnings:')
    health.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  return health.isHealthy
}

/**
 * Gets environment-specific database connection info
 */
export function getDatabaseInfo() {
  const projectMatch = environment.supabase.url.match(/https:\/\/([^.]+)\.supabase\.co/)
  const projectRef = projectMatch ? projectMatch[1] : 'unknown'
  
  return {
    projectRef,
    url: environment.supabase.url,
    isProduction: environment.isProduction,
    isDevelopment: environment.isDevelopment,
  }
}
