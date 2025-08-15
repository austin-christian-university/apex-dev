"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MicrosoftLoginTransition } from '@/components/auth/microsoft-login-transition'

function MicrosoftRedirectContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/home'

  const handleProceed = () => {
    // Redirect to the actual Microsoft OAuth endpoint
    window.location.href = `/api/auth/microsoft?redirectTo=${encodeURIComponent(redirectTo)}`
  }

  return (
    <MicrosoftLoginTransition onProceed={handleProceed} />
  )
}

export default function MicrosoftRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <MicrosoftRedirectContent />
    </Suspense>
  )
}
