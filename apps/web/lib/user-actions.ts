'use server'

import { getUserProfileWithEvents } from '@/lib/events'
import { submitAttendance } from '@/lib/attendance-actions'
import { submitMonthlyCheckin } from '@/lib/monthly-checkin-actions'
import type { AttendanceSubmission, SmallGroupMonthlyCheckSubmission, DreamTeamMonthlyCheckSubmission } from '@acu-apex/types'
import { getCompanyStandings } from '@/lib/company'

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

/**
 * Server action to submit monthly check-in
 */
export async function submitMonthlyCheckinAction(
  eventId: string,
  studentId: string,
  submissionData: SmallGroupMonthlyCheckSubmission | DreamTeamMonthlyCheckSubmission
) {
  return await submitMonthlyCheckin(eventId, studentId, submissionData)
}

/**
 * Server action to get company standings
 */
export async function getCompanyStandingsAction() {
  return await getCompanyStandings()
}
