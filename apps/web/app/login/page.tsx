"use client"

import { LoginDialog } from "@/components/auth/login-dialog"
import { Button } from "@acu-apex/ui"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { user, loading } = useAuth()
  
  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }
  
  // Don't show login page if user is already authenticated
  // AuthProvider will handle the redirect automatically
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Redirecting to home...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to ACU Apex</h1>
          <p className="text-muted-foreground">
            Your comprehensive student development platform
          </p>
        </div>
        
        {message && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}
        
        <LoginDialog 
          trigger={
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          }
          onLoginSuccess={() => {
            // Auth provider will handle the state change automatically
            // The useEffect above will handle the redirect
          }}
        />
        
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
} 