'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@acu-apex/ui'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"
import { isStaff } from '@acu-apex/types'

interface StaffLayoutProps {
  children: React.ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      // User not authenticated, redirect to login
      router.push('/login')
      return
    }

    if (!isStaff(user)) {
      // User doesn't have staff permissions, redirect to appropriate home
      if (user.role === 'student' || user.role === 'officer') {
        router.push('/home')
      } else {
        // Unknown role, redirect to login
        router.push('/login')
      }
      return
    }

    // User is authenticated and has staff permissions
    setIsCheckingAccess(false)
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Checking Access</h3>
            <p className="text-muted-foreground">
              Verifying your permissions...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied if user doesn't have proper permissions
  if (!user || !isStaff(user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need staff permissions to access this page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Current role: {user?.role || 'Unknown'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User has proper permissions, render the staff content
  return <>{children}</>
}
