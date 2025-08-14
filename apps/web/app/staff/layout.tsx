'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Sheet, SheetContent, SheetTrigger } from '@acu-apex/ui'
import { AlertCircle, Loader2, Menu, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"
import { isStaff } from '@acu-apex/types'

interface StaffLayoutProps {
  children: React.ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  // User has proper permissions, render the staff layout with header
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">ACU Apex - Staff Portal</h1>
            <Badge variant="secondary">Staff</Badge>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">Staff Portal</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 space-y-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Staff Portal
                  </div>
                  <a 
                    href="/staff" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Home
                  </a>
                  <a 
                    href="/staff/events" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4 mr-3" />
                    Event Management
                  </a>
                  <a 
                    href="/staff/approvals" 
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Event Approvals
                  </a>
                </nav>

                {/* Footer */}
                <div className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut()
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}
