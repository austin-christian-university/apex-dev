"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

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
        // User is authenticated
        console.log('User authenticated, checking if on login page:', pathname === '/login')
        if (pathname === '/login') {
          // Redirect from login to home or saved path
          const redirectPath = localStorage.getItem('authRedirectPath') || '/home'
          console.log('Attempting redirect to:', redirectPath)
          
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => {
            router.push(redirectPath as any)
          }, 100)
        }
      } else {
        // User is not authenticated
        const isProtectedRoute = pathname === '/home' || pathname.startsWith('/company') || pathname.startsWith('/profile')
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