"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { checkOnboardingStatus } from "@/lib/onboarding/sync"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Use the client creation function
  const supabase = createClient()

  // Check onboarding status and redirect appropriately
  const handleUserAuthenticated = async (authenticatedUser: User) => {
    try {
      const onboardingResult = await checkOnboardingStatus(authenticatedUser.id)
      
      if (onboardingResult.error) {
        console.error('Failed to check onboarding status:', onboardingResult.error)
        // Continue with normal flow if check fails
        handlePostAuthRedirect(authenticatedUser, true)
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
        // User has completed onboarding
        handlePostAuthRedirect(authenticatedUser, hasCompletedOnboarding, onboardingResult.user?.role)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // Continue with normal flow if check fails
      handlePostAuthRedirect(authenticatedUser, true)
    }
  }

  const handlePostAuthRedirect = (authenticatedUser: User, hasCompletedOnboarding: boolean, userRole?: string) => {
    if (pathname === '/login') {
      // Determine where to redirect based on onboarding status and role
      let redirectPath = '/home' // default
      
      if (!hasCompletedOnboarding) {
        redirectPath = '/role-selection'
      } else if (userRole === 'staff') {
        redirectPath = '/staff'
      } else {
        // Get saved redirect path or default to home
        redirectPath = localStorage.getItem('authRedirectPath') || '/home'
      }
      
      console.log('Redirecting authenticated user to:', redirectPath)
      
      // Use setTimeout to avoid potential race conditions
      setTimeout(() => {
        router.push(redirectPath as any)
      }, 100)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      console.log('Auth state changed:', { newUser: !!newUser, pathname })
      setUser(newUser)
      
      // Handle redirects based on auth state
      if (newUser) {
        // User is authenticated - check onboarding status
        handleUserAuthenticated(newUser)
      } else {
        // User is not authenticated
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
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 