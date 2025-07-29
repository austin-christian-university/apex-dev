import { Button } from "@acu-apex/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"

interface ErrorPageProps {
  searchParams: { message?: string }
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const message = searchParams.message || "Something went wrong with your authentication"
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try signing in again or contact support if the problem persists.
          </p>
          <Button asChild className="w-full">
            <a href="/login">
              Back to Login
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 