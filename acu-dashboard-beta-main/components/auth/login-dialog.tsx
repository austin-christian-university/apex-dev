"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Apple, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-provider"

interface LoginDialogProps {
  trigger?: React.ReactNode;
  onLoginSuccess?: () => void;
}

export function LoginDialog({ trigger, onLoginSuccess }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'login' | 'signup' | 'magic-link'>('login')
  const router = useRouter()
  const pathname = usePathname()
  const { showToast } = useToast()

  // Create Supabase client using the new SSR client
  const supabase = createClient()

  // Save current path to localStorage when dialog opens
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('authRedirectPath', pathname || '/')
    }
  }, [isOpen, pathname])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Get the current path for redirection
    const redirectPath = localStorage.getItem('authRedirectPath') || '/'

    if (!email) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    if (view === 'magic-link') {
      // Magic link login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        // Show success message for magic link
        setError(null)
        showToast({
          title: "Magic Link Sent!",
          description: "Check your email for the login link. It may take a few minutes to arrive.",
          variant: "success",
          duration: 6000
        })
        setIsOpen(false)
      }
    } else {
      // Regular email/password login or signup
      if (!password) {
        setError("Password is required")
        setIsLoading(false)
        return
      }

      if (view === 'signup') {
        // Validate confirm password
        if (!confirmPassword) {
          setError("Please confirm your password")
          setIsLoading(false)
          return
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setIsLoading(false)
          return
        }

        // Sign up with email and password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`,
          }
        })

        if (error) {
          setError(error.message)
        } else {
          // Show success message for sign up
          setError(null)
          showToast({
            title: "Account Created!",
            description: "Check your email to confirm your account. We've sent you a verification link.",
            variant: "success",
            duration: 6000
          })
          setIsOpen(false)
        }
      } else {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          // Success - close dialog and refresh
          setIsOpen(false)
          if (onLoginSuccess) onLoginSuccess()
          // Navigate to the saved redirect path
          const redirectPath = localStorage.getItem('authRedirectPath') || '/'
          router.push(redirectPath)
        }
      }
    }
    
    setIsLoading(false)
  }

  const handleOAuthLogin = async (provider: "github" | "google" | "apple") => {
    setError(null);
    setIsLoading(true);
    
    // Get the current path for redirection
    const redirectPath = localStorage.getItem('authRedirectPath') || '/'
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`,
        },
      });
  
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // No need to close dialog or set isLoading to false as we're redirecting
    } catch (err) {
      console.error("OAuth login error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError(null)
    setView('login')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetState()
    }}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Login</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' ? 'Sign in to your account' : 
             view === 'signup' ? 'Create an account' : 'Magic link sign in'}
          </DialogTitle>
          <DialogDescription>
            {view === 'login' ? 'Enter your email below to sign in to your account.' : 
             view === 'signup' ? 'Enter your details below to create your account.' : 
             'Enter your email and we\'ll send you a magic link.'}
          </DialogDescription>
        </DialogHeader>

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 pt-2">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {view !== 'magic-link' && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {view === 'signup' && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : view === 'login' ? (
              'Sign In with Email'
            ) : view === 'signup' ? (
              'Sign Up with Email'
            ) : (
              'Send Magic Link'
            )}
          </Button>

          {view === 'login' && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setView('signup')}
                disabled={isLoading}
              >
                Create New Account
              </Button>
            </div>
          )}
        </form>

        {/* OAuth buttons */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 text-sm text-gray-500 dark:text-gray-400 bg-background">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin("github")}
            disabled={isLoading}
            className="flex items-center justify-center"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading}
            className="flex items-center justify-center"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="sr-only">Google</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthLogin("apple")}
            disabled={isLoading}
            className="flex items-center justify-center"
          >
            <Apple className="h-4 w-4" />
            <span className="sr-only">Apple</span>
          </Button>
        </div>

        {/* Toggle Views */}
        <div className="mt-4 text-center text-sm">
          {view === 'login' ? (
            <>
              <p className="text-muted-foreground mb-2">Don&apos;t have an account yet?</p>
              <Button variant="link" className="px-2 text-sm font-medium" onClick={() => setView('signup')}>
                Create a new account
              </Button>
              <Button variant="link" className="px-2 text-sm" onClick={() => setView('magic-link')}>
                Login with magic link
              </Button>
            </>
          ) : view === 'signup' ? (
            <Button variant="link" className="px-2 text-sm" onClick={() => setView('login')}>
              Already have an account? Sign in
            </Button>
          ) : (
            <Button variant="link" className="px-2 text-sm" onClick={() => setView('login')}>
              Back to login
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}