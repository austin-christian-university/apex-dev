"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { MicrosoftLoginTransition } from '@/components/auth/microsoft-login-transition'

export default function MicrosoftRedirectPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams.get('redirectTo') || '/home'

  const handleProceed = () => {
    // Redirect to the actual Microsoft OAuth endpoint
    window.location.href = `/api/auth/microsoft?redirectTo=${encodeURIComponent(redirectTo)}`
  }

  return (
    <MicrosoftLoginTransition onProceed={handleProceed} />
  )
}
