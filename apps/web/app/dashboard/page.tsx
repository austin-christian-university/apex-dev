'use client'

import { Button } from "@acu-apex/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }
  
  // AuthProvider will handle redirect if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.email}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Development</CardTitle>
              <CardDescription>Track your academic progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor your scores, attendance, and achievements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Manage your tuition and fees</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View payment history and financial aid information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Records</CardTitle>
              <CardDescription>Access your academic history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review grades, transcripts, and degree progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 