'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Progress } from "@acu-apex/ui"
import { CalendarDays, Trophy, Users, TrendingUp } from "lucide-react"

// Mock data - will be replaced with real data later
const mockCompanyStandings = [
  { name: "Alpha Company", score: 3.85, rank: 1, members: 24, trend: "+0.12" },
  { name: "Beta Company", score: 3.72, rank: 2, members: 26, trend: "+0.05" },
  { name: "Gamma Company", score: 3.68, rank: 3, members: 23, trend: "-0.03" },
  { name: "Delta Company", score: 3.45, rank: 4, members: 25, trend: "+0.08" },
]

const mockUpcomingEvents = [
  {
    title: "Chapel Attendance Check-in",
    description: "Weekly chapel participation required",
    dueDate: "Tomorrow, 10:00 AM",
    type: "spiritual",
    urgent: true
  },
  {
    title: "Community Service Hours",
    description: "Submit this month's service hours",
    dueDate: "Due in 3 days",
    type: "professional", 
    urgent: false
  },
  {
    title: "GBE Team Building Event",
    description: "Company team building activity",
    dueDate: "Friday, 6:00 PM",
    type: "team",
    urgent: false
  }
]

export default function HomePage() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Action Required */}
      {mockUpcomingEvents.filter(event => event.urgent).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Action Required</h2>
          </div>
          
          {mockUpcomingEvents.filter(event => event.urgent).map((event, index) => (
            <Card key={index} className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <p className="text-xs font-medium text-destructive">{event.dueDate}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Urgent
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
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        
        <div className="space-y-2">
          {mockUpcomingEvents.filter(event => !event.urgent).map((event, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <p className="text-xs text-muted-foreground">{event.dueDate}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {event.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 