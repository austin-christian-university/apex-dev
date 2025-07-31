import { Card, CardContent } from "@acu-apex/ui"
import { CalendarDays, Trophy, Users } from "lucide-react"
import { Skeleton } from "@acu-apex/ui"

export default function HomePageLoading() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Action Required Loading */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Action Required</h2>
        </div>
        
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Company Standings Loading */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Company Standings</h2>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events Loading */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 