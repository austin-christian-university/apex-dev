import type { UserEvent, User, Student, Company } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

interface UserProfileWithEvents {
  user: User
  student?: Student  
  company?: Company
}
import { 
  isEventApplicableToUser, 
  categorizeEventByDueDate, 

  isEventEligibleForAttendance,
  isEventEligibleForMonthlyCheckin,
  isEventEligibleForParticipation
} from '@acu-apex/utils'

/**
 * Fetch events for a specific user based on their role and company
 */
export async function fetchUserEvents(
  userRole: string,
  userCompanyId?: string,
  limit: number = 20,
  supabaseClient?: SupabaseClient
): Promise<{
  events: UserEvent[]
  error?: string
}> {
  try {
    const supabase = supabaseClient || await createClient()

    // Build the query based on user's company
    let query = supabase
      .from('event_instances')
      .select('*')
      .eq('is_active', true)
      .neq('event_type', 'dev_event')
      // RLS already hides non-homepage events for other users; this filter keeps
      // client logic explicit and efficient for public feed scenarios
      .eq('show_on_homepage', true)
      .order('due_date', { ascending: true })
      .limit(limit)

    // If user has a company, we need to fetch both company-specific and general events
    if (userCompanyId) {
      query = query.or(`required_company.eq.${userCompanyId},required_company.is.null`)
    } else {
      // If no company, only fetch general events (no company requirement)
      query = query.is('required_company', null)
    }

    const { data: events, error } = await query

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`)
    }

    // Process and categorize events
    const userEvents: UserEvent[] = (events || [])
      .filter(event => isEventApplicableToUser(event, userRole, userCompanyId))
      .map(event => {
        const categorization = categorizeEventByDueDate(event)
        return {
          event,
          ...categorization
        }
      })
      .sort((a, b) => {
        // Sort by urgency: past due first, then urgent, then by due date
        if (a.isPastDue && !b.isPastDue) return -1
        if (!a.isPastDue && b.isPastDue) return 1
        if (a.isUrgent && !b.isUrgent) return -1
        if (!a.isUrgent && b.isUrgent) return 1
        return a.daysUntilDue - b.daysUntilDue
      })

    return { events: userEvents }
  } catch (error) {
    console.error('Event fetch error:', error)
    return {
      events: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Fetch urgent events (due today or overdue) for a user
 */
export async function fetchUrgentEvents(
  userRole: string,
  userCompanyId?: string,
  supabaseClient?: SupabaseClient
): Promise<{
  events: UserEvent[]
  error?: string
}> {
  try {
    const { events, error } = await fetchUserEvents(userRole, userCompanyId, 50, supabaseClient)
    
    if (error) {
      return { events: [], error }
    }

    const urgentEvents = events.filter(event => event.isPastDue)
    
    return { events: urgentEvents }
  } catch (error) {
    console.error('Urgent events fetch error:', error)
    return {
      events: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Fetch upcoming events (not urgent, not past due) for a user
 */
export async function fetchUpcomingEvents(
  userRole: string,
  userCompanyId?: string,
  limit: number = 10,
  supabaseClient?: SupabaseClient
): Promise<{
  events: UserEvent[]
  error?: string
}> {
  try {
    const { events, error } = await fetchUserEvents(userRole, userCompanyId, 50, supabaseClient)
    
    if (error) {
      return { events: [], error }
    }

    const upcomingEvents = events
      .filter(event => !event.isPastDue)
      .slice(0, limit)
    
    return { events: upcomingEvents }
  } catch (error) {
    console.error('Upcoming events fetch error:', error)
    return {
      events: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Check if student has submitted for specific events
 */
async function getStudentSubmissions(
  studentId: string,
  eventIds: string[],
  supabase: SupabaseClient
): Promise<Set<string>> {
  if (eventIds.length === 0) return new Set()
  
  const { data: submissions } = await supabase
    .from('event_submissions')
    .select('event_id')
    .eq('student_id', studentId)
    .in('event_id', eventIds)
  
  return new Set(submissions?.map(sub => sub.event_id) || [])
}

/**
 * Check if participation events are completed for an officer
 * A participation event is completed when all company members have submissions
 */
async function getCompletedParticipationEvents(
  studentId: string,
  participationEventIds: string[],
  supabase: SupabaseClient
): Promise<Set<string>> {
  if (participationEventIds.length === 0) return new Set()
  
  // Get the officer's company
  const { data: student } = await supabase
    .from('students')
    .select('company_id')
    .eq('id', studentId)
    .single()
    
  if (!student?.company_id) return new Set()
  
  // Get all company members
  const { data: companyMembers } = await supabase
    .from('students')
    .select('id')
    .eq('company_id', student.company_id)
    
  if (!companyMembers) return new Set()
  
  const completedEvents = new Set<string>()
  
  // Check each participation event
  for (const eventId of participationEventIds) {
    // Get submissions for this event from company members
    const { data: submissions } = await supabase
      .from('event_submissions')
      .select('student_id')
      .eq('event_id', eventId)
      .in('student_id', companyMembers.map(m => m.id))
    
    // If all company members have submissions, mark as completed
    if (submissions && submissions.length === companyMembers.length) {
      completedEvents.add(eventId)
    }
  }
  
  return completedEvents
}

/**
 * Get user profile with events for homepage
 */
export async function getUserProfileWithEvents(authUserId: string, supabaseClient?: SupabaseClient): Promise<{
  profile?: UserProfileWithEvents
  urgentEvents?: UserEvent[]
  upcomingEvents?: UserEvent[]
  error?: string
}> {
  try {
    const supabase = supabaseClient || await createClient()

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (userError) {
      console.error('Failed to fetch user:', userError.message)
      throw new Error(`Failed to fetch user: ${userError.message}`)
    }

    let profile: UserProfileWithEvents = { user }
    let userCompanyId: string | undefined

    // If user is a student or officer, get student and company data
    if (user.role === 'student' || user.role === 'officer') {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          companies (
            id,
            name,
            description,
            is_active
          )
        `)
        .eq('id', authUserId)
        .single()

      if (studentError) {
        throw new Error(`Failed to fetch student data: ${studentError.message}`)
      }

      profile = {
        user,
        student,
        company: student.companies
      }
      userCompanyId = student.company_id
    }

    // Fetch all events first
    const { events: allEvents, error: eventsError } = await fetchUserEvents(user.role, userCompanyId, 50, supabase)
    
    if (eventsError) {
      return { profile, error: eventsError }
    }

    // For students and officers, check which interactive events they've already submitted
    let submittedEventIds = new Set<string>()
    let completedParticipationEventIds = new Set<string>()
    
    if ((user.role === 'student' || user.role === 'officer') && profile.student) {
      // Get attendance and monthly checkin events that the individual has submitted
      const individualEventIds = allEvents
        .filter(event => 
          event.event.event_type === 'attendance' || 
          event.event.event_type === 'monthly_checkin'
        )
        .map(event => event.event.id)
      
      submittedEventIds = await getStudentSubmissions(profile.student.id, individualEventIds, supabase)
      
      // For officers, also check participation events (completed when all company members have submissions)
      if (user.role === 'officer') {
        const participationEventIds = allEvents
          .filter(event => event.event.event_type === 'participation')
          .map(event => event.event.id)
          
        completedParticipationEventIds = await getCompletedParticipationEvents(profile.student.id, participationEventIds, supabase)
      }
    }

    // Enhance events with submission status and eligibility
    const enhancedEvents = allEvents.map(event => {
      const isInteractiveEvent = event.event.event_type === 'attendance' || 
                                event.event.event_type === 'monthly_checkin' ||
                                event.event.event_type === 'participation'
      
      // For participation events, check if completed by officer (all company members have submissions)
      // For other events, check if individual has submitted
      let hasSubmitted = false
      if (event.event.event_type === 'participation') {
        hasSubmitted = completedParticipationEventIds.has(event.event.id)
      } else if (isInteractiveEvent) {
        hasSubmitted = submittedEventIds.has(event.event.id)
      }
      
      const isEligibleForAttendance = event.event.event_type === 'attendance' && event.event.due_date 
        ? isEventEligibleForAttendance(event.event.due_date) 
        : false
      const isEligibleForMonthlyCheckin = event.event.event_type === 'monthly_checkin' && event.event.due_date
        ? isEventEligibleForMonthlyCheckin(event.event.due_date)
        : false
      const isEligibleForParticipation = event.event.event_type === 'participation' && event.event.due_date
        ? isEventEligibleForParticipation(event.event.due_date)
        : false
      
      return {
        ...event,
        hasSubmitted,
        isEligibleForAttendance,
        isEligibleForMonthlyCheckin,
        isEligibleForParticipation
      }
    })

    // Filter urgent events: exclude interactive events that have been submitted
    const urgentEvents = enhancedEvents.filter(event => {
      if (!event.isPastDue) return false
      
      // For interactive events (attendance, monthly check-ins, and participation), only show as urgent if not submitted
      if (event.event.event_type === 'attendance' || 
          event.event.event_type === 'monthly_checkin' ||
          event.event.event_type === 'participation') {
        return !event.hasSubmitted
      }
      
      return true
    })

    // Filter upcoming events: include all events with submission status
    const upcomingEvents = enhancedEvents
      .filter(event => !event.isPastDue)
      .slice(0, 5)

    return {
      profile,
      urgentEvents,
      upcomingEvents,
      error: undefined
    }
  } catch (error) {
    console.error('Profile with events fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 