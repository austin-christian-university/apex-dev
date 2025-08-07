'use server'

import { 
  getPendingSubmissions, 
  approveSubmission, 
  rejectSubmission,
  submitCommunityServiceEvent,
  submitJobPromotionEvent,
  submitCredentialsEvent
} from '@/lib/non-routine-events'
import type { CommunityServiceSubmission, JobPromotionSubmission, CredentialsSubmission } from '@acu-apex/types'

/**
 * Server action to get pending submissions for staff approval
 */
export async function getPendingSubmissionsAction() {
  return await getPendingSubmissions()
}

/**
 * Server action to approve a submission
 */
export async function approveSubmissionAction(submissionId: string, pointsGranted: number) {
  return await approveSubmission(submissionId, pointsGranted)
}

/**
 * Server action to reject a submission
 */
export async function rejectSubmissionAction(submissionId: string, rejectionReason?: string) {
  return await rejectSubmission(submissionId, rejectionReason)
}

/**
 * Server action to submit a community service event
 */
export async function submitCommunityServiceEventAction(
  studentId: string,
  submissionData: CommunityServiceSubmission
) {
  return await submitCommunityServiceEvent(studentId, submissionData)
}

/**
 * Server action to submit a job promotion event
 */
export async function submitJobPromotionEventAction(
  studentId: string,
  submissionData: JobPromotionSubmission
) {
  return await submitJobPromotionEvent(studentId, submissionData)
}

/**
 * Server action to submit a credentials event
 */
export async function submitCredentialsEventAction(
  studentId: string,
  submissionData: CredentialsSubmission
) {
  return await submitCredentialsEvent(studentId, submissionData)
}
