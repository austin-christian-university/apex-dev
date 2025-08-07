import type { RecurringEvent, EventInstance, Company } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/client'

/**
 * Staff-specific event management functions
 * Handles both recurring events and event instances
 */

export interface StaffEventFilters {
  eventType?: 'self_report' | 'attendance'
  isActive?: boolean
  companyId?: string
  createdBy?: string
}

export interface EventsResponse {
  recurringEvents: RecurringEvent[]
  eventInstances: EventInstance[]
  companies: Company[]
  error?: string
}

/**
 * Fetch all events for staff management view
 */
export async function fetchAllEventsForStaff(
  filters: StaffEventFilters = {}
): Promise<EventsResponse> {
  try {
    const supabase = createClient()

    // Build queries for both recurring events and event instances
    let recurringQuery = supabase
      .from('recurring_events')
      .select('*')
      .order('created_at', { ascending: false })

    let instancesQuery = supabase
      .from('event_instances')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.eventType) {
      recurringQuery = recurringQuery.eq('event_type', filters.eventType)
      instancesQuery = instancesQuery.eq('event_type', filters.eventType)
    }

    if (filters.isActive !== undefined) {
      recurringQuery = recurringQuery.eq('is_active', filters.isActive)
      instancesQuery = instancesQuery.eq('is_active', filters.isActive)
    }

    if (filters.companyId) {
      recurringQuery = recurringQuery.eq('required_company', filters.companyId)
      instancesQuery = instancesQuery.eq('required_company', filters.companyId)
    }

    if (filters.createdBy) {
      recurringQuery = recurringQuery.eq('created_by', filters.createdBy)
      instancesQuery = instancesQuery.eq('created_by', filters.createdBy)
    }

    // Execute all queries in parallel
    const [recurringResult, instancesResult, companiesResult] = await Promise.all([
      recurringQuery,
      instancesQuery,
      supabase.from('companies').select('*').eq('is_active', true).order('name')
    ])

    if (recurringResult.error) {
      throw new Error(`Failed to fetch recurring events: ${recurringResult.error.message}`)
    }

    if (instancesResult.error) {
      throw new Error(`Failed to fetch event instances: ${instancesResult.error.message}`)
    }

    if (companiesResult.error) {
      throw new Error(`Failed to fetch companies: ${companiesResult.error.message}`)
    }

    return {
      recurringEvents: recurringResult.data || [],
      eventInstances: instancesResult.data || [],
      companies: companiesResult.data || []
    }
  } catch (error) {
    console.error('Staff events fetch error:', error)
    return {
      recurringEvents: [],
      eventInstances: [],
      companies: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create a new recurring event
 */
export async function createRecurringEvent(
  eventData: Omit<RecurringEvent, 'id' | 'created_at'>,
  userId: string
): Promise<{ success: boolean; event?: RecurringEvent; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('recurring_events')
      .insert([{ 
        ...eventData, 
        created_by: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create recurring event: ${error.message}`)
    }

    return { success: true, event: data }
  } catch (error) {
    console.error('Create recurring event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update a recurring event
 */
export async function updateRecurringEvent(
  eventId: string,
  updates: Partial<Omit<RecurringEvent, 'id' | 'created_at' | 'created_by'>>
): Promise<{ success: boolean; event?: RecurringEvent; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('recurring_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update recurring event: ${error.message}`)
    }

    return { success: true, event: data }
  } catch (error) {
    console.error('Update recurring event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Delete a recurring event
 */
export async function deleteRecurringEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('recurring_events')
      .delete()
      .eq('id', eventId)

    if (error) {
      throw new Error(`Failed to delete recurring event: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Delete recurring event error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Create a new event instance
 */
export async function createEventInstance(
  eventData: Omit<EventInstance, 'id' | 'created_at'>,
  userId: string
): Promise<{ success: boolean; event?: EventInstance; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_instances')
      .insert([{ 
        ...eventData, 
        created_by: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create event instance: ${error.message}`)
    }

    return { success: true, event: data }
  } catch (error) {
    console.error('Create event instance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update an event instance
 */
export async function updateEventInstance(
  eventId: string,
  updates: Partial<Omit<EventInstance, 'id' | 'created_at' | 'created_by'>>
): Promise<{ success: boolean; event?: EventInstance; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_instances')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update event instance: ${error.message}`)
    }

    return { success: true, event: data }
  } catch (error) {
    console.error('Update event instance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Delete an event instance
 */
export async function deleteEventInstance(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('event_instances')
      .delete()
      .eq('id', eventId)

    if (error) {
      throw new Error(`Failed to delete event instance: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Delete event instance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Bulk activate/deactivate events
 */
export async function bulkUpdateEventStatus(
  eventIds: string[],
  isActive: boolean,
  type: 'recurring' | 'instance'
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const supabase = createClient()
    const tableName = type === 'recurring' ? 'recurring_events' : 'event_instances'

    const { data, error } = await supabase
      .from(tableName)
      .update({ is_active: isActive })
      .in('id', eventIds)
      .select('id')

    if (error) {
      throw new Error(`Failed to bulk update events: ${error.message}`)
    }

    return { success: true, updatedCount: data?.length || 0 }
  } catch (error) {
    console.error('Bulk update events error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get event instances generated from a specific recurring event
 */
export async function getInstancesFromRecurringEvent(
  recurringEventId: string
): Promise<{ instances: EventInstance[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('event_instances')
      .select('*')
      .eq('recurring_event_id', recurringEventId)
      .order('due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch event instances: ${error.message}`)
    }

    return { instances: data || [] }
  } catch (error) {
    console.error('Fetch instances from recurring event error:', error)
    return {
      instances: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}