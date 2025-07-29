"use client"

import { useState, useEffect } from "react"
import { LoginDialog } from "@/components/auth/login-dialog"
import { Button } from "@acu-apex/ui"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@acu-apex/utils"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { user, loading } = useAuth()
  
  // Typing animation state
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [showButton, setShowButton] = useState(false)
  
  const welcomeMessage = "Welcome to Apex."
  const typingSpeed = 100
  const pauseAfterTyping = 1200

  // Typing animation effect
  useEffect(() => {
    let currentIndex = 0
    let typingTimer: NodeJS.Timeout

    const typeMessage = () => {
      if (currentIndex < welcomeMessage.length) {
        setDisplayedText(welcomeMessage.slice(0, currentIndex + 1))
        currentIndex++
        typingTimer = setTimeout(typeMessage, typingSpeed)
      } else {
        setIsTypingComplete(true)
        // Hide cursor after typing is complete
        setTimeout(() => {
          setShowCursor(false)
          // Show button after the pause
          setTimeout(() => {
            setShowButton(true)
          }, 300)
        }, pauseAfterTyping)
      }
    }

    // Start typing after a brief delay
    const startTimer = setTimeout(typeMessage, 800)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(typingTimer)
    }
  }, [welcomeMessage, typingSpeed, pauseAfterTyping])

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [showCursor])

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary/8 via-background to-background animate-pulse" 
           style={{ animationDuration: "4s" }} />
      
      {/* Subtle moving light effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-secondary/3 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: "6s", animationDelay: "1s" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/2 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Fixed container for the welcome text */}
        <div className="relative h-32 flex items-center justify-center mb-16">
          <h1 className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-wide",
            "drop-shadow-2xl animate-gentle-glow",
            isTypingComplete && "animate-pulse"
          )} style={{ animationDuration: "3s" }}>
            {displayedText}
            <span 
              className={cn(
                "ml-1 inline-block w-1 h-[1.2em] bg-foreground transition-all duration-100",
                showCursor ? "opacity-100 shadow-lg" : "opacity-0",
                "drop-shadow-sm"
              )}
            />
          </h1>
        </div>

        {/* Fixed container for dots and button */}
        <div className="h-24 flex items-center justify-center mb-16">
          {isTypingComplete && !showButton && (
            <div className="flex justify-center space-x-3 animate-fade-in">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" 
                   style={{ animationDelay: "0ms", animationDuration: "1.4s" }} />
              <div className="w-1.5 h-1.5 bg-secondary/80 rounded-full animate-bounce" 
                   style={{ animationDelay: "200ms", animationDuration: "1.4s" }} />
              <div className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce" 
                   style={{ animationDelay: "400ms", animationDuration: "1.4s" }} />
            </div>
          )}
          
          {showButton && (
            <div className="animate-fade-in">
              {message && (
                <div className="p-4 rounded-lg bg-muted/50 border mb-6">
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>
              )}
              
              <LoginDialog 
                trigger={
                  <Button size="lg" className="w-full text-lg py-6">
                    Get Started
                  </Button>
                }
                onLoginSuccess={() => {
                  // Auth provider will handle the state change automatically
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/30 pointer-events-none" />
    </div>
  )
} 