"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { BackgroundAnimation } from "@/components/background-animation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { validateCredentials } from "@/lib/data"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await validateCredentials(email, password)
      
      if (result) {
        // Store user info in localStorage
        localStorage.setItem("userType", result.type)
        localStorage.setItem("userData", JSON.stringify(result.user))
        
        toast({
          title: "Welcome back!",
          description: `Signed in as ${result.user.name}`,
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during login. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <BackgroundAnimation />

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 z-[-5]" />

      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl z-[-1]" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-500/20 to-pink-400/20 rounded-full blur-3xl z-[-1]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              >
                <Image
                  src={isDark ? "/acu-logo-white.png" : "/acu-logo-bronze.png"}
                  alt="Austin Christian University"
                  width={96}
                  height={96}
                  className="w-40"
                />
              </motion.div>
            </div>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access The Den
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="your.email@acu.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#c4a777] to-[#c4a777] hover:from-[#877250] hover:to-[#877250] transition-all duration-[2000ms] ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="#" className="text-primary hover:underline">
                Contact your administrator
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        &copy; {new Date().getFullYear()} Austin Christian University. All rights reserved.
      </motion.div>
    </div>
  )
}
