import { Card, CardContent } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { CalendarDays, Trophy, Users, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getUserProfileWithEvents } from "@/lib/events"
import { redirect } from "next/navigation"

// Mock company standings data - will be replaced with real data later
const mockCompanyStandings = [
  { name: "Alpha Company", score: 3.85, rank: 1, members: 24, trend: "+0.12" },
  { name: "Beta Company", score: 3.72, rank: 2, members: 26, trend: "+0.05" },
  { name: "Gamma Company", score: 3.68, rank: 3, members: 23, trend: "-0.03" },
  { name: "Delta Company", score: 3.45, rank: 4, members: 25, trend: "+0.08" },
]

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user profile and events
  const { profile, urgentEvents, upcomingEvents, error: eventsError } = await getUserProfileWithEvents(user.id, supabase)

  if (eventsError) {
    console.error('Failed to fetch events:', eventsError)
    // Continue with empty events rather than failing completely
  }

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Action Required */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Action Required</h2>
          </div>
          
          {urgentEvents.map((userEvent) => (
            <Card key={userEvent.event.id} className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{userEvent.event.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {userEvent.event.description || 'No description available'}
                    </p>
                    <p className={`text-xs font-medium ${userEvent.isPastDue ? 'text-destructive' : 'text-orange-600'}`}>
                      {userEvent.formattedDueDate}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Company Standings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Company Standings</h2>
        </div>
        
        <div className="space-y-2">
          {mockCompanyStandings.map((company) => (
            <Card key={company.name} className={company.rank === 1 ? "border-secondary/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <Badge variant={company.rank === 1 ? "secondary" : "outline"} className="w-8">
                        {company.rank}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{company.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{company.members} members</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{company.score}</p>
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className={`h-3 w-3 ${company.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={company.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                        {company.trend}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          
          <div className="space-y-2">
            {upcomingEvents.map((userEvent) => (
              <Card key={userEvent.event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{userEvent.event.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {userEvent.event.description || 'No description available'}
                      </p>
                      <p className={`text-xs ${userEvent.isUrgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                        {userEvent.formattedDueDate}
                      </p>
                    </div>
                                         <Badge 
                       variant={userEvent.isUrgent ? "secondary" : "outline"} 
                       className={`text-xs capitalize ${userEvent.isUrgent ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}`}
                     >
                       {userEvent.isUrgent ? 'Due Soon' : userEvent.event.event_type.replace('_', ' ')}
                     </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Events State */}
      {(!urgentEvents || urgentEvents.length === 0) && (!upcomingEvents || upcomingEvents.length === 0) && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Events</h2>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events at this time</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 