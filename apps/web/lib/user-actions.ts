'use server'

import { getUserProfileWithEvents } from '@/lib/events'
import { submitAttendance } from '@/lib/attendance-actions'
import type { AttendanceSubmission } from '@acu-apex/types'

/**
 * Server action to get user profile with events
 */
export async function getUserProfileWithEventsAction(authUserId: string) {
  return await getUserProfileWithEvents(authUserId)
}

/**
 * Server action to submit attendance
 */
export async function submitAttendanceAction(
  eventId: string,
  studentId: string,
  submissionData: AttendanceSubmission
) {
  return await submitAttendance(eventId, studentId, submissionData)
}
