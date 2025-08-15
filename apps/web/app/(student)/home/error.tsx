'use client'

import { Card, CardContent } from "@acu-apex/ui"
import { Button } from "@acu-apex/ui"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function HomePageError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn&apos;t load your events and company data. Please try again.
          </p>
          <Button onClick={reset} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 