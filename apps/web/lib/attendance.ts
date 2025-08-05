import { isEventEligibleForAttendance } from '@acu-apex/utils'

export interface EventInstance {
  id: string
  name: string
  description: string | null
  due_date: string
  event_type: string
}

// Re-export the utility function for convenience
export { isEventEligibleForAttendance }