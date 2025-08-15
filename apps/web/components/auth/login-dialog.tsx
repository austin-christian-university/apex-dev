"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  Button,
  Input,
  Label,
  Alert,
  AlertDescription
} from "@acu-apex/ui"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface LoginDialogProps {
  trigger?: React.ReactNode;
  onLoginSuccess?: () => void;
}

export function LoginDialog({ trigger, onLoginSuccess }: LoginDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const pathname = usePathname()
  
  // Check if we're in development environment
  const isDev = process.env.NODE_ENV === 'development'

  // Save current path to localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Don't save login paths as redirect destination  
      const redirectPath = pathname === '/login' ? '/home' : pathname
      localStorage.setItem('authRedirectPath', redirectPath)
    }
  }, [isOpen, pathname])

  const handleMicrosoftLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    // Get the current path for redirection
    const redirectPath = localStorage.getItem('authRedirectPath') || '/home'
    
    try {
      // Redirect to our transition page first
      router.push(`/auth/microsoft-redirect?redirectTo=${encodeURIComponent(redirectPath)}`);
    } catch (err) {
      console.error("Microsoft OAuth login error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!adminEmail || !adminPassword) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      })

      if (error) {
        setError(error.message)
      } else {
        // Success - close dialog and let auth provider handle state change
        setIsOpen(false)
        if (onLoginSuccess) onLoginSuccess()
      }
    } catch (err) {
      console.error("Admin login error:", err)
      setError("An unexpected error occurred")
    }
    
    setIsLoading(false)
  };

  const resetState = () => {
    setError(null)
    setShowAdminLogin(false)
    setAdminEmail("")
    setAdminPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetState()
    }}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Login</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-[95%] rounded-lg mx-auto">

        <div className="py-6">
          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showAdminLogin ? (
            <>
              {/* Microsoft login button */}
              <Button
                variant="default"
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                    </svg>
                    Login with your school account
                  </>
                )}
              </Button>

              {/* Admin login link - only in dev */}
              {isDev && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                    disabled={isLoading}
                  >
                    Admin login
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Admin login form */}
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-medium text-foreground">Admin Login</h3>
                  <p className="text-xs text-muted-foreground">Development environment only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-sm">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-sm">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdminLogin(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}