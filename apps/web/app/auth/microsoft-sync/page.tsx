"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AceWelcome } from '@/components/auth/ace-welcome'

export default function MicrosoftSyncPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [syncCompleted, setSyncCompleted] = useState(false)
  const [syncResult, setSyncResult] = useState<{success: boolean, isNewUser: boolean, userEmail: string} | null>(null)
  
  const redirectTo = searchParams.get('redirectTo') || '/home'
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    // Check for OAuth errors
    if (errorParam) {
      setError('Microsoft authentication failed. Please try again.')
      return
    }

    // Check for required parameters
    if (!code || !state) {
      setError('Invalid authentication callback. Please try again.')
      return
    }

    // Perform sync and redirect - keep it simple
    const performSyncAndRedirect = async () => {
      try {
        console.log('Starting Microsoft OAuth sync...')
        const response = await fetch(`/api/auth/microsoft/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state, redirectTo }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Sync API error:', errorData)
          throw new Error(errorData.error || 'Authentication failed')
        }

        const result = await response.json()
        console.log('Sync completed:', result)
        
        // Store result and mark as completed
        setSyncResult(result)
        setSyncCompleted(true)
        
      } catch (error) {
        console.error('Sync error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
      }
    }

    performSyncAndRedirect()
  }, [code, state, errorParam, redirectTo, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-700">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-100 mb-2">Authentication Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Just show loading
  return <MicrosoftSyncProgress />
}