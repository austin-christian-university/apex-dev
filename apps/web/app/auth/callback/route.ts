import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Creating a handler to a GET request to route /auth/callback
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  // if "next" or "redirectTo" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? searchParams.get('redirectTo') ?? '/dashboard'
  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

  const supabase = await createClient()

  // Handle OAuth callback (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('OAuth callback error:', error.message)
    return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent(error.message)}`)
  }

  // Handle email verification (token_hash)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Email verification error:', error.message)
    return NextResponse.redirect(`${origin}/error?message=${encodeURIComponent(error.message)}`)
  }

  // No valid parameters, redirect to error
  return NextResponse.redirect(`${origin}/error?message=Invalid authentication callback`)
} 