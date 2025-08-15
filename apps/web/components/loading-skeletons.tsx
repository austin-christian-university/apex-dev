import { Card, CardContent, CardHeader, Skeleton } from "@acu-apex/ui"

// General page loading skeleton for simple layouts
export function PageLoadingSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile page loading skeleton
export function ProfileLoadingSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Header section with photo and basic info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 text-center w-full">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats sections */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Company standings loading skeleton
export function CompanyStandingsLoadingSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Header with company selector */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Rankings list */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Auth loading skeleton for login/redirect screens
export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <Skeleton className="h-16 w-16 rounded-xl mx-auto" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple centered loading skeleton for minimal cases
export function CenteredLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-sm mx-4">
        <CardContent className="p-6 text-center space-y-4">
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Suspense fallback skeleton
export function SuspenseLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex justify-center space-x-1">
          <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
          <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.2s]" />
          <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  )
}
