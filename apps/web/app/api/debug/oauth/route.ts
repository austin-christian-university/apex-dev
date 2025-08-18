import { NextResponse } from 'next/server'
import { buildUrl, getSiteUrl, environment } from '@/lib/config/environment'

export async function GET() {
  // Only allow in development/preview environments
  if (environment.isProduction) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const redirectUri = buildUrl(getSiteUrl(), '/api/auth/microsoft/callback')
  
  return NextResponse.json({
    environment: {
      env: environment.env,
      isDevelopment: environment.isDevelopment,
      isProduction: environment.isProduction,
      isPreview: environment.isPreview,
    },
    urls: {
      siteUrl: getSiteUrl(),
      appUrl: environment.urls.app,
    },
    oauth: {
      redirectUri,
      clientId: environment.microsoft.clientId ? '✓ Set' : '❌ Missing',
      clientSecret: environment.microsoft.clientSecret ? '✓ Set' : '❌ Missing',
      tenantId: environment.microsoft.tenantId ? '✓ Set' : '❌ Missing',
    },
    supabase: {
      url: environment.supabase.url ? '✓ Set' : '❌ Missing',
      anonKey: environment.supabase.anonKey ? '✓ Set' : '❌ Missing',
      serviceRoleKey: environment.supabase.serviceRoleKey ? '✓ Set' : '❌ Missing',
    },
    instructions: {
      azureRedirectUri: `Add this redirect URI to your Azure AD app: ${redirectUri}`,
      vercelEnvVars: 'Make sure all environment variables are set in Vercel dashboard',
    }
  }, { status: 200 })
}
