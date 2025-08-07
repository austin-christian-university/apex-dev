'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@acu-apex/ui"
import { CalendarDays, Trophy, Users, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getUserProfileWithEventsAction } from "@/lib/user-actions"
import { EventCard } from "@/components/event-card"
import { AddEventDialog } from "@/components/add-event-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

// Mock company standings data - will be replaced with real data later
const mockCompanyStandings = [
  { name: "Alpha Company", score: 3.85, rank: 1, members: 24, trend: "+0.12" },
  { name: "Beta Company", score: 3.72, rank: 2, members: 26, trend: "+0.05" },
  { name: "Gamma Company", score: 3.68, rank: 3, members: 23, trend: "-0.03" },
  { name: "Delta Company", score: 3.45, rank: 4, members: 25, trend: "+0.08" },
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [urgentEvents, setUrgentEvents] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { profile, urgentEvents, upcomingEvents, error: eventsError } = await getUserProfileWithEventsAction(user.id)

      if (eventsError) {
        console.error('Failed to fetch events:', eventsError)
      }

      setProfile(profile)
      setUrgentEvents(urgentEvents || [])
      setUpcomingEvents(upcomingEvents || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load user data on mount
  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push('/login')
      return
    }
    
    loadUserData()
  }, [user, router, loadUserData])

  if (loading || !user) {
    return <div className="px-4 py-6 max-w-md mx-auto">Loading...</div>
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
            <EventCard
              key={userEvent.event.id}
              event={userEvent.event}
              studentId={profile?.student.id || ''}
              formattedDueDate={userEvent.formattedDueDate}
              isUrgent={userEvent.isUrgent}
              isPastDue={userEvent.isPastDue}
              variant="urgent"
              hasSubmitted={userEvent.hasSubmitted}
              isEligibleForAttendance={userEvent.isEligibleForAttendance}
            />
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
          <div className="grid grid-cols-2 gap-4 items-center">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAddEventDialog(true)}
                className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>+ Add Event</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {upcomingEvents.map((userEvent) => (
              <EventCard
                key={userEvent.event.id}
                event={userEvent.event}
                studentId={profile?.student.id || ''}
                formattedDueDate={userEvent.formattedDueDate}
                isUrgent={userEvent.isUrgent}
                isPastDue={userEvent.isPastDue}
                variant="upcoming"
                hasSubmitted={userEvent.hasSubmitted}
                isEligibleForAttendance={userEvent.isEligibleForAttendance}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Event Section - show when no upcoming events but there might be urgent events */}
      {(!upcomingEvents || upcomingEvents.length === 0) && urgentEvents && urgentEvents.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 items-center">
            <h2 className="text-lg font-semibold">Other Events</h2>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAddEventDialog(true)}
                className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>+ Add Event</span>
              </button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events. Add your own achievements!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Events State */}
      {(!urgentEvents || urgentEvents.length === 0) && (!upcomingEvents || upcomingEvents.length === 0) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Events</h2>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAddEventDialog(true)}
                className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <span>+ Add Event</span>
              </button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events at this time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Event Dialog */}
      <AddEventDialog 
        open={showAddEventDialog} 
        onOpenChange={setShowAddEventDialog}
        onSubmitSuccess={loadUserData}
      />
    </div>
  )
} 