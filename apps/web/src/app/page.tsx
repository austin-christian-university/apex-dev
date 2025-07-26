import { Button } from "@acu-apex/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to ACU Apex</CardTitle>
          <CardDescription>
            Student Development Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A comprehensive platform for tracking student development and growth.
          </p>
          <Button className="w-full">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 