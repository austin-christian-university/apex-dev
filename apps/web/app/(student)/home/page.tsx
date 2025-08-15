'use client'

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@acu-apex/ui"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@acu-apex/ui"

import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import { getUserProfileWithEventsAction } from "@/lib/user-actions"
import { getStudentProfileData } from "@/lib/profile-data"
import { EventCard } from "@/components/event-card"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import type { UserEvent, User, Student, Company, StudentHolisticGPA } from "@acu-apex/types"

interface UserProfileWithEvents {
  user: User
  student?: Student
  company?: Company
}

interface CategoryBreakdown {
  category_id: string
  category_name: string
  category_display_name: string
  category_score: number
  subcategories: Array<{
    subcategory_id: string
    subcategory_name: string
    subcategory_display_name: string
    subcategory_score: number
    data_points_count?: number
  }>
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfileWithEvents | null>(null)
  const [urgentEvents, setUrgentEvents] = useState<UserEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([])
  const [holisticGPA, setHolisticGPA] = useState<StudentHolisticGPA | null>(null)
  const [loading, setLoading] = useState(true)
  const [overdueExpanded, setOverdueExpanded] = useState(false)
  const [upcomingExpanded, setUpcomingExpanded] = useState(false)

  const loadUserData = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const [eventsResult, profileResult] = await Promise.all([
        getUserProfileWithEventsAction(user.id),
        getStudentProfileData(user.id),
      ])

      const { profile, urgentEvents, upcomingEvents, error: eventsError } = eventsResult || {}

      if (eventsError) console.error('Failed to fetch events:', eventsError)

      setProfile(profile || null)
      setUrgentEvents(urgentEvents || [])
      setUpcomingEvents(upcomingEvents || [])
      setHolisticGPA(profileResult.holisticGPA || null)
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

  // Generate radar chart data from holistic GPA data
  const breakdownList = holisticGPA && holisticGPA.category_breakdown ? 
    Object.values(holisticGPA.category_breakdown as unknown as Record<string, CategoryBreakdown>) : []
  const radarChartData = breakdownList.map((cat: CategoryBreakdown) => ({
    categoryId: cat.category_id,
    pillar: (cat.category_display_name || cat.category_name || '').replace(' Standing', '').replace(' Performance', '').replace(' Execution', ''),
    score: Number(cat.category_score) || 0,
    fullScore: 4.0
  }))

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Top: Photo and Holistic GPA */}
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="flex justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.user.photo || ""} />
            <AvatarFallback className="text-xl">
              {(profile.user.first_name?.[0] || '').toUpperCase()}{(profile.user.last_name?.[0] || '').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold">{typeof holisticGPA?.holistic_gpa === 'number' ? holisticGPA.holistic_gpa.toFixed(2) : 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Holistic GPA</p>
        </div>
      </div>

      {/* Radial Chart */}
      {holisticGPA && radarChartData.length > 0 ? (
        <Card>
          <CardHeader className="items-center pb-2">
            <CardTitle className="text-base">GPA Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-2">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px] w-full"
            >
              <RadarChart data={radarChartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12 }} />
                <PolarGrid />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.6}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Your holistic GPA is being calculated</p>
          </CardContent>
        </Card>
      )}

      {/* Collapsible Overdue Events */}
      {urgentEvents && urgentEvents.length > 0 && (
        <Collapsible open={overdueExpanded} onOpenChange={setOverdueExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Overdue Events</span>
                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {urgentEvents.length}
                    </Badge>
                  </div>
                  {overdueExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4 pt-0 space-y-2">
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Collapsible Upcoming Events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <Collapsible open={upcomingExpanded} onOpenChange={setUpcomingExpanded}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Upcoming Events</span>
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {upcomingEvents.length}
                    </Badge>
                  </div>
                  {upcomingExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4 pt-0 space-y-2">
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
} 