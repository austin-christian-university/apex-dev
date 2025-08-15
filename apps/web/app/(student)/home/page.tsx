'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"

import { CalendarDays, Trophy, TrendingUp } from "lucide-react"
import { getUserProfileWithEventsAction, getCompanyStandingsAction } from "@/lib/user-actions"
import { EventCard } from "@/components/event-card"
import { AddEventDialog } from "@/components/add-event-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import type { UserEvent, User, Student, Company } from "@acu-apex/types"
import type { CompanyStanding } from "@/lib/company"

interface UserProfileWithEvents {
  user: User
  student?: Student
  company?: Company
}

interface CompanyStandingUI {
  name: string
  score: number
  rank: number
  trend?: number
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [profile, setProfile] = useState<UserProfileWithEvents | null>(null)
  const [urgentEvents, setUrgentEvents] = useState<UserEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([])
  const [companyStandings, setCompanyStandings] = useState<CompanyStandingUI[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const [eventsResult, standingsResult] = await Promise.all([
        getUserProfileWithEventsAction(user.id),
        getCompanyStandingsAction(),
      ])

      const { profile, urgentEvents, upcomingEvents, error: eventsError } = eventsResult || {}
      const { standings, error: standingsError } = standingsResult || { standings: [] }

      if (eventsError) console.error('Failed to fetch events:', eventsError)
      if (standingsError) console.error('Failed to fetch company standings:', standingsError)

      setProfile(profile || null)
      setUrgentEvents(urgentEvents || [])
      setUpcomingEvents(upcomingEvents || [])
      setCompanyStandings(
        (standings || []).map((s: CompanyStanding) => ({
          name: s.name,
          score: s.score,
          rank: s.rank,
          trend: s.trend,
        }))
      )
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

  if (!profile?.student) {
    return <div className="px-4 py-6 max-w-md mx-auto">Student profile not found</div>
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
              studentId={profile.student!.id}
              formattedDueDate={userEvent.formattedDueDate}
              isUrgent={userEvent.isUrgent}
              isPastDue={userEvent.isPastDue}
              variant="urgent"
              hasSubmitted={userEvent.hasSubmitted}
              isEligibleForAttendance={userEvent.isEligibleForAttendance}
              isEligibleForMonthlyCheckin={userEvent.isEligibleForMonthlyCheckin}
              isEligibleForParticipation={userEvent.isEligibleForParticipation}
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
          {companyStandings.map((company) => (
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
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{company.score.toFixed(2)}</p>
                    {typeof company.trend === 'number' && (
                      <div className="flex items-center space-x-1 text-xs">
                        <TrendingUp className={`h-3 w-3 ${company.trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        <span className={company.trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {company.trend >= 0 ? `+${company.trend.toFixed(2)}` : company.trend.toFixed(2)}
                        </span>
                      </div>
                    )}
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
                <span>+ Add Accomplishment</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {upcomingEvents.map((userEvent) => (
              <EventCard
                key={userEvent.event.id}
                event={userEvent.event}
                studentId={profile.student!.id}
                formattedDueDate={userEvent.formattedDueDate}
                isUrgent={userEvent.isUrgent}
                isPastDue={userEvent.isPastDue}
                variant="upcoming"
                hasSubmitted={userEvent.hasSubmitted}
                isEligibleForAttendance={userEvent.isEligibleForAttendance}
                isEligibleForMonthlyCheckin={userEvent.isEligibleForMonthlyCheckin}
                isEligibleForParticipation={userEvent.isEligibleForParticipation}
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