import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Handle OAuth errors
  if (error) {
    console.error('Microsoft OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error?message=${encodeURIComponent('Microsoft authentication failed')}`)
  }
  
  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error?message=${encodeURIComponent('Invalid OAuth callback')}`)
  }
  
  const cookieStore = await cookies()
  const redirectPath = cookieStore.get('oauth_redirect')?.value || '/home'
  
  // Redirect to sync progress page with the necessary parameters
  const syncUrl = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/microsoft-sync`)
  syncUrl.searchParams.set('code', code)
  syncUrl.searchParams.set('state', state)
  syncUrl.searchParams.set('redirectTo', redirectPath)
  
  return NextResponse.redirect(syncUrl.toString())
}
