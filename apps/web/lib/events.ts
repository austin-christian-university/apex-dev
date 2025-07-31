import type { EventInstance, UserEvent, EventFilters } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { 
  isEventApplicableToUser, 
  categorizeEventByDueDate, 
  filterAndSortEvents 
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
 * Get user profile with events for homepage
 */
export async function getUserProfileWithEvents(authUserId: string, supabaseClient?: SupabaseClient): Promise<{
  profile?: any
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

    let profile: any = { user }
    let userCompanyId: string | undefined

    // If user is a student, get student and company data
    if (user.role === 'student') {
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

    // Fetch events in parallel
    const [urgentResult, upcomingResult] = await Promise.all([
      fetchUrgentEvents(user.role, userCompanyId, supabase),
      fetchUpcomingEvents(user.role, userCompanyId, 5, supabase)
    ])

    return {
      profile,
      urgentEvents: urgentResult.events,
      upcomingEvents: upcomingResult.events,
      error: urgentResult.error || upcomingResult.error
    }
  } catch (error) {
    console.error('Profile with events fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 