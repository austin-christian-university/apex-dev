"use client"

import { useSearchParams } from 'next/navigation'
import { MicrosoftLoginTransition } from '@/components/auth/microsoft-login-transition'

export default function MicrosoftRedirectPage() {
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
