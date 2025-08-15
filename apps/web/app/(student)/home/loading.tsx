import { Card, CardContent, CardHeader } from "@acu-apex/ui"
import { Skeleton } from "@acu-apex/ui"

export default function HomePageLoading() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Photo and Holistic GPA Loading */}
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="flex justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>

      {/* Radial Chart Loading */}
      <Card>
        <CardHeader className="items-center pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="pb-4 px-2">
          <div className="mx-auto aspect-square max-h-[220px] w-full flex items-center justify-center">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Events Loading */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 