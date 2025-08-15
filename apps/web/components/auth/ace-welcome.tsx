"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface AceWelcomeProps {
  onComplete?: () => void
  syncCompleted?: boolean
  syncResult?: {
    success: boolean
    isNewUser: boolean
    userEmail: string
  }
}

export function AceWelcome({ onComplete, syncCompleted, syncResult }: AceWelcomeProps) {
  const [showMainText, setShowMainText] = useState(false)
  const [showSecondaryText, setShowSecondaryText] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Determine if this is a new user
  const isNewUser = syncResult?.isNewUser ?? false
  
  // Text content based on user type
  const mainText = isNewUser ? "Welcome to your Blueprint." : "Preparing your Blueprint..."
  const secondaryText = isNewUser ? "Let's get started." : null

  useEffect(() => {
    if (!syncCompleted) return

    // Animation sequence
    const sequence = async () => {
      // Small delay, then show main text
      await new Promise(resolve => setTimeout(resolve, 800))
      setShowMainText(true)

      // For new users, show secondary text after delay
      if (isNewUser) {
        await new Promise(resolve => setTimeout(resolve, 2500))
        setShowSecondaryText(true)
        
        // Wait a bit more, then complete
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        // For existing users, shorter wait
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      setIsComplete(true)
      
      // Final delay before calling onComplete
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 800)
    }

    sequence()
  }, [syncCompleted, isNewUser, onComplete])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">


      <div className="relative z-10 text-center">
        {/* Ace Logo with animations */}
        <div className="mb-12 relative">
          <div 
            className={`transition-all duration-1000 ease-out ${
              syncCompleted 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-75 rotate-0'
            }`}
          >
            <div className="relative">

              
              {/* Main logo */}
              <Image
                src="/images/ace_logo.png"
                alt="Ace Logo"
                width={120}
                height={120}
                className="mx-auto relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Main text */}
        <div className="space-y-6">
          <h1 
            className={`text-3xl font-bold text-foreground transition-all duration-1000 ease-out ${
              showMainText
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {mainText}
          </h1>

          {/* Secondary text for new users */}
          {isNewUser && (
            <p 
              className={`text-xl text-muted-foreground transition-all duration-1000 ease-out ${
                showSecondaryText
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {secondaryText}
            </p>
          )}
        </div>

        {/* Subtle loading indicator */}
        <div className="mt-12">
          <div 
            className={`flex justify-center space-x-2 transition-opacity duration-1000 ${
              isComplete ? 'opacity-0' : 'opacity-60'
            }`}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-secondary rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fade out overlay when complete */}
      <div 
        className={`absolute inset-0 bg-background transition-opacity duration-500 pointer-events-none ${
          isComplete ? 'opacity-0' : 'opacity-0'
        }`}
      />
    </div>
  )
}
