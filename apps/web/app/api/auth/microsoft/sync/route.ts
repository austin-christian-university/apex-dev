import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildUrl, getSiteUrl, environment } from '@/lib/config/environment'

interface MicrosoftTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface MicrosoftUser {
  id: string
  displayName: string
  mail: string | null
  userPrincipalName: string
  givenName?: string
  surname?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('Microsoft sync API called')
    const { code, state, redirectTo } = await request.json()
    
    console.log('Received params:', { code: !!code, state: !!state, redirectTo })
    
    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    const cookieStore = await cookies()
    const storedState = cookieStore.get('oauth_state')?.value
    const allCookies = cookieStore.getAll()
    
    console.log('State validation:', { 
      provided: state, 
      stored: storedState,
      allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      environment: environment.env,
      siteUrl: getSiteUrl()
    })
    
    // Validate state parameter
    if (state !== storedState) {
      console.error('State parameter mismatch')
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      )
    }
    
    // Exchange authorization code for tokens
    console.log('Exchanging code for tokens...')
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${environment.microsoft.tenantId || 'common'}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: environment.microsoft.clientId,
        client_secret: environment.microsoft.clientSecret,
        code,
        redirect_uri: buildUrl(getSiteUrl(), '/api/auth/microsoft/callback'),
        grant_type: 'authorization_code',
      }),
    })
    
    console.log('Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to exchange code for tokens' },
        { status: 400 }
      )
    }
    
    const tokenData: MicrosoftTokenResponse = await tokenResponse.json()
    console.log('Token exchange successful')
    
    // Get user information from Microsoft Graph
    console.log('Fetching user info from Microsoft Graph...')
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })
    
    console.log('User response status:', userResponse.status)
    
    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error('Failed to fetch user info from Microsoft Graph:', errorData)
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 400 }
      )
    }
    
    const userData: MicrosoftUser = await userResponse.json()
    console.log('User data received:', { id: userData.id, email: userData.mail || userData.userPrincipalName })
    
    const email = userData.mail || userData.userPrincipalName
    
    if (!email) {
      console.error('No email found in Microsoft account')
      return NextResponse.json(
        { error: 'No email found in Microsoft account' },
        { status: 400 }
      )
    }
    
    console.log('Creating Supabase client...')
    const supabase = await createClient()
    
    // Try to sign in existing user first
    console.log('Attempting to sign in user with email:', email)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: `microsoft_oauth_${userData.id}`, // Consistent password based on Microsoft ID
    })
    
    let isNewUser = false
    
    if (signInError && signInError.message.includes('Invalid login credentials')) {
      isNewUser = true
      // User doesn't exist, create them
      console.log('User not found, creating new user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: `microsoft_oauth_${userData.id}`, // Consistent password based on Microsoft ID
        options: {
          data: {
            full_name: userData.displayName,
            given_name: userData.givenName,
            family_name: userData.surname,
            provider: 'microsoft',
            microsoft_id: userData.id,
          },
        },
      })
      
      if (signUpError) {
        console.error('Failed to create user in Supabase:', signUpError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }
      
      if (!signUpData.user) {
        console.error('No user created')
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }
      
      console.log('User created successfully:', signUpData.user.id)
    } else if (signInError) {
      console.error('Failed to sign in user:', signInError)
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      )
    } else if (!signInData.user) {
      console.error('No user signed in')
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      )
    } else {
      console.log('User signed in successfully:', signInData.user.id)
    }
    
    // Clear OAuth cookies
    console.log('Clearing OAuth cookies...')
    cookieStore.delete('oauth_state')
    cookieStore.delete('oauth_redirect')
    cookieStore.delete('oauth_nonce')
    
    console.log('Microsoft OAuth sync completed successfully')
    return NextResponse.json({ 
      success: true, 
      isNewUser,
      userEmail: email
    })
    
  } catch (error) {
    console.error('Microsoft OAuth sync error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
