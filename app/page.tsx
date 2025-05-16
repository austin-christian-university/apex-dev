"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("admin")
  const [isLoading, setIsLoading] = useState(false)
  const particlesRef = useRef<HTMLDivElement>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading
    setTimeout(() => {
      // In a real app, we would authenticate the user here
      // and store their role in a context or cookie
      localStorage.setItem("userRole", role)
      router.push("/dashboard")
    }, 1500)
  }

  // Create particles for background animation
  useEffect(() => {
    if (!particlesRef.current) return

    const container = particlesRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Clear existing particles
    container.innerHTML = ""

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"

      // Random size between 5px and 20px
      const size = Math.random() * 15 + 5
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`

      // Random opacity
      particle.style.opacity = `${Math.random() * 0.5 + 0.1}`

      // Random animation delay
      particle.style.animationDelay = `${Math.random() * 8}s`

      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 12 + 8}s`

      container.appendChild(particle)
    }

    return () => {
      container.innerHTML = ""
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden animated-gradient">
      {/* Particles background */}
      <div ref={particlesRef} className="absolute inset-0 z-0"></div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pulse-glow"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl pulse-glow"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <div className="flex flex-col items-center mb-8 float">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">ACU</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Austin Christian University</h1>
          <p className="text-blue-100 dark:text-blue-200">Student Portfolio Dashboard</p>
        </div>

        <Card className="glassmorphism border-white/20 dark:border-white/10 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@acu.edu"
                  required
                  className="bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Sign in as</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/50">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">School Administrator</SelectItem>
                    <SelectItem value="leader">Student Leader</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-blue-100 dark:text-blue-200">
          <p>© {new Date().getFullYear()} Austin Christian University. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
