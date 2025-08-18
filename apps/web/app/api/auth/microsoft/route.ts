import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { buildUrl, getSiteUrl } from '@/lib/config/environment'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectPath = searchParams.get('redirectTo') || '/home'
  
  const clientId = process.env.AZURE_AD_CLIENT_ID
  const tenantId = process.env.AZURE_AD_TENANT_ID || 'common'
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'Azure AD client ID not configured' },
      { status: 500 }
    )
  }
  
  const state = uuidv4()
  const nonce = uuidv4()
  
  // Store state and redirect path in cookies for validation
  const cookieStore = await cookies()
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  })
  cookieStore.set('oauth_redirect', redirectPath, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  })
  cookieStore.set('oauth_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  })
  
  const redirectUri = buildUrl(getSiteUrl(), '/api/auth/microsoft/callback')
  
  const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_mode', 'query')
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('nonce', nonce)
      authUrl.searchParams.set('prompt', 'select_account') // Force account selection screen
    authUrl.searchParams.set('domain_hint', 'organizations') // Hint to use organizational accounts
    authUrl.searchParams.set('login_hint', '') // Clear any login hints
    
    // Try to influence the UI theme (experimental)
    authUrl.searchParams.set('ui_locales', 'en-US')
    authUrl.searchParams.set('mkt', 'en-US')
  
  return NextResponse.redirect(authUrl.toString())
}
