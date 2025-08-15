import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle role-based redirects for authenticated users
  if (user) {
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // Skip redirect logic for API routes, auth callbacks, and static assets
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.') // static files
    ) {
      return supabaseResponse
    }

    // Fetch user role from our users table
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (!error && userData) {
        const { role, has_completed_onboarding } = userData

        // Redirect to onboarding if not completed
        if (!has_completed_onboarding) {
          if (!pathname.startsWith('/role-selection') && 
              !pathname.startsWith('/pending-approval') &&
              !pathname.startsWith('/personal-info') &&
              !pathname.startsWith('/photo-upload') &&
              !pathname.startsWith('/company-selection') &&
              !pathname.startsWith('/personality-assessments') &&
              !pathname.startsWith('/complete')) {
            url.pathname = '/role-selection'
            return NextResponse.redirect(url)
          }
          return supabaseResponse
        }

        // Role-based redirects for completed users
        if (role === 'staff' || role === 'admin') {
          // Staff/admin users should go to staff area
          if (pathname === '/' || pathname === '/home' || pathname.startsWith('/(student)')) {
            url.pathname = '/staff'
            return NextResponse.redirect(url)
          }
        } else if (role === 'student' || role === 'officer') {
          // Student/officer users should go to student area
          if (pathname === '/' || pathname.startsWith('/staff')) {
            url.pathname = '/home'
            return NextResponse.redirect(url)
          }
        }
      }
    } catch (error) {
      // If we can't fetch user data, let the request continue
      console.error('Middleware: Failed to fetch user role:', error)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
} 