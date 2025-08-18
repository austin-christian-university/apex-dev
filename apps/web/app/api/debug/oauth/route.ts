import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildUrl, getSiteUrl, environment } from '@/lib/config/environment'

export async function GET() {
  // Only allow in development/preview environments
  if (environment.isProduction) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const redirectUri = buildUrl(getSiteUrl(), '/api/auth/microsoft/callback')
  
  return NextResponse.json({
    environment: {
      env: environment.env,
      isDevelopment: environment.isDevelopment,
      isProduction: environment.isProduction,
      isPreview: environment.isPreview,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    },
    urls: {
      siteUrl: getSiteUrl(),
      appUrl: environment.urls.app,
      isSecure: getSiteUrl().startsWith('https://'),
    },
    cookies: {
      count: allCookies.length,
      names: allCookies.map(c => c.name),
      oauthState: cookieStore.get('oauth_state')?.value ? '✓ Present' : '❌ Missing',
      oauthRedirect: cookieStore.get('oauth_redirect')?.value ? '✓ Present' : '❌ Missing',
      oauthNonce: cookieStore.get('oauth_nonce')?.value ? '✓ Present' : '❌ Missing',
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
      testOAuth: `Start OAuth flow: ${getSiteUrl()}/api/auth/microsoft`,
    }
  }, { status: 200 })
}
