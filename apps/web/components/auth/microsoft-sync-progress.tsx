"use client"

// NOTE: This is a simple loading spinner component that can be reused 
// across the app for other loading states. Currently not used in Microsoft auth flow
// but kept for future loading screens.

import { useEffect } from "react"

interface MicrosoftSyncProgressProps {
  onComplete?: () => void
  syncCompleted?: boolean
  syncResult?: {
    success: boolean
    isNewUser: boolean
    userEmail: string
  }
}

// Minimal loading spinner with our dark theme
const MinimalSpinner = () => {
  return (
    <div className="relative w-12 h-12">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-slate-800 animate-spin">
        <div className="absolute inset-0 rounded-full border-t-2 border-secondary" />
      </div>
      
      {/* Inner core */}
      <div className="absolute inset-3 rounded-full bg-slate-800 animate-pulse" />
    </div>
  )
}

export function MicrosoftSyncProgress({ onComplete, syncCompleted }: MicrosoftSyncProgressProps) {
  
  // Simple completion handler
  useEffect(() => {
    if (syncCompleted && onComplete) {
      onComplete()
    }
  }, [syncCompleted, onComplete])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center flex flex-col items-center justify-center">
        {/* Loading spinner */}
        <div className="mb-8">
          <MinimalSpinner />
        </div>
        
        {/* Simple text */}
        <h1 className="text-xl font-medium text-gray-100">
          Preparing your Blueprint...
        </h1>
      </div>
    </div>
  )
}