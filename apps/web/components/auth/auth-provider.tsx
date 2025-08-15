"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { User } from "@acu-apex/types"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { checkOnboardingStatus } from "@/lib/onboarding/sync"

interface AuthContextType {
  user: User | null // Our extended user type with role
  supabaseUser: SupabaseUser | null // Original Supabase user
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Use the client creation function
  const supabase = createClient()

  // Fetch user data from our users table when Supabase user changes
  const fetchUserData = async (authUserId: string): Promise<User | null> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in our users table - they need to complete onboarding
          console.log('User not found in users table, may need onboarding')
          return null
        }
        throw error
      }

      return userData as User
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    }
  }

  // Check onboarding status and redirect appropriately
  const handleUserAuthenticated = async (authenticatedSupabaseUser: SupabaseUser) => {
    try {
      // First, try to fetch our extended user data
      const userData = await fetchUserData(authenticatedSupabaseUser.id)
      
      if (userData) {
        // User exists in our database, set both users
        setUser(userData)
        setSupabaseUser(authenticatedSupabaseUser)
        
        // Handle post-auth redirect with role information
        handlePostAuthRedirect(userData, true, userData.role)
        return
      }

      // User not in our users table - check onboarding status using Supabase method
      const onboardingResult = await checkOnboardingStatus(authenticatedSupabaseUser.id)
      
      if (onboardingResult.error) {
        console.error('Failed to check onboarding status:', onboardingResult.error)
        // Continue with normal flow if check fails
        handlePostAuthRedirect(null, false)
        return
      }

      const hasCompletedOnboarding = onboardingResult.hasCompleted
      console.log('Onboarding status:', { hasCompleted: hasCompletedOnboarding, userRole: onboardingResult.user?.role })

      if (!hasCompletedOnboarding) {
        // User needs to complete onboarding
        console.log('User needs onboarding, redirecting to role-selection')
        if (!pathname.startsWith('/role-selection') && 
            !pathname.startsWith('/pending-approval') &&
            !pathname.startsWith('/personal-info') &&
            !pathname.startsWith('/photo-upload') &&
            !pathname.startsWith('/company-selection') &&
            !pathname.startsWith('/personality-assessments') &&
            !pathname.startsWith('/complete')) {
          router.push('/role-selection')
        }
      } else {
        // User has completed onboarding but we don't have their data yet - fetch it
        const userData = await fetchUserData(authenticatedSupabaseUser.id)
        setUser(userData)
        setSupabaseUser(authenticatedSupabaseUser)
        handlePostAuthRedirect(userData, hasCompletedOnboarding, userData?.role)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // Continue with normal flow if check fails
      handlePostAuthRedirect(null, true)
    }
  }

  const handlePostAuthRedirect = (authenticatedUser: User | null, hasCompletedOnboarding: boolean, userRole?: string) => {
    if (pathname === '/login') {
      // Determine where to redirect based on onboarding status and role
      let redirectPath = '/home' // default
      
      if (!hasCompletedOnboarding) {
        redirectPath = '/role-selection'
      } else if (userRole === 'staff' || userRole === 'admin') {
        redirectPath = '/staff'
      } else {
        // Get saved redirect path or default to home
        redirectPath = localStorage.getItem('authRedirectPath') || '/home'
      }
      
      console.log('Redirecting authenticated user to:', redirectPath)
      
      // Use setTimeout to avoid potential race conditions
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push(redirectPath as any)
      }, 100)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        // User is authenticated, fetch our extended user data
        const userData = await fetchUserData(supabaseUser.id)
        setUser(userData)
        setSupabaseUser(supabaseUser)
      } else {
        setUser(null)
        setSupabaseUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newSupabaseUser = session?.user ?? null
      console.log('Auth state changed:', { newUser: !!newSupabaseUser, pathname })
      
      // Handle redirects based on auth state
      if (newSupabaseUser) {
        // User is authenticated - check onboarding status and fetch user data
        handleUserAuthenticated(newSupabaseUser)
      } else {
        // User is not authenticated
        setUser(null)
        setSupabaseUser(null)
        
        const isProtectedRoute = pathname === '/home' || 
                                pathname.startsWith('/company') || 
                                pathname.startsWith('/profile') ||
                                pathname.startsWith('/staff') ||
                                pathname.startsWith('/role-selection') ||
                                pathname.startsWith('/pending-approval') ||
                                pathname.startsWith('/personal-info') ||
                                pathname.startsWith('/photo-upload') ||
                                pathname.startsWith('/company-selection') ||
                                pathname.startsWith('/personality-assessments') ||
                                pathname.startsWith('/complete')
        
        console.log('User not authenticated, checking if on protected route:', isProtectedRoute)
        if (isProtectedRoute) {
          // Redirect from protected routes to login
          console.log('Redirecting to login from protected route')
          router.push('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, pathname])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 