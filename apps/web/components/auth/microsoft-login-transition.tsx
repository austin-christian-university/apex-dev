"use client"

import { useState } from 'react'
import { Card, CardContent } from '@acu-apex/ui'

interface MicrosoftLoginTransitionProps {
  onProceed: () => void
}

export function MicrosoftLoginTransition({ onProceed }: MicrosoftLoginTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleProceed = () => {
    setIsTransitioning(true)
    // Small delay for smooth transition
    setTimeout(() => {
      onProceed()
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          {/* Microsoft logo with your styling */}
          <div className="w-16 h-16 bg-[#0078d4] rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Connecting to your school account
          </h1>
          
          <p className="text-muted-foreground mb-8">
            You&apos;ll be redirected to Microsoft to sign in with your school account. 
            You&apos;ll be redirected back to Blueprint after signing in.
          </p>

          <button
            onClick={handleProceed}
            disabled={isTransitioning}
            className={`w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isTransitioning ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              'Sign in with Microsoft'
            )}
          </button>

        </CardContent>
      </Card>
    </div>
  )
}
