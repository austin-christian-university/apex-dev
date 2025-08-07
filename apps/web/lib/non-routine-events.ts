'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  CommunityServiceSubmissionSchema, 
  JobPromotionSubmissionSchema, 
  CredentialsSubmissionSchema,
  type CommunityServiceSubmission, 
  type JobPromotionSubmission, 
  type CredentialsSubmission 
} from '@acu-apex/types'
import { revalidatePath } from 'next/cache'

/**
 * Submit a community service event
 */
export async function submitCommunityServiceEvent(
  studentId: string,
  submissionData: CommunityServiceSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data
    const validatedData = CommunityServiceSubmissionSchema.parse(submissionData)
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Submit the non-routine event
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: null, // Non-routine events don't have a specific event_id
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        // NOTE: These columns need to be added to the database schema
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit community service event')
    }
    
    // Revalidate relevant pages
    revalidatePath('/home')
    revalidatePath('/staff/approvals')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Community service submission error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Submit a job promotion event
 */
export async function submitJobPromotionEvent(
  studentId: string,
  submissionData: JobPromotionSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data
    const validatedData = JobPromotionSubmissionSchema.parse(submissionData)
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Submit the non-routine event
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: null, // Non-routine events don't have a specific event_id
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        // NOTE: These columns need to be added to the database schema
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit job promotion event')
    }
    
    // Revalidate relevant pages
    revalidatePath('/home')
    revalidatePath('/staff/approvals')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Job promotion submission error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Submit a credentials event
 */
export async function submitCredentialsEvent(
  studentId: string,
  submissionData: CredentialsSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data
    const validatedData = CredentialsSubmissionSchema.parse(submissionData)
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Submit the non-routine event
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: null, // Non-routine events don't have a specific event_id
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        // NOTE: These columns need to be added to the database schema
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit credentials event')
    }
    
    // Revalidate relevant pages
    revalidatePath('/home')
    revalidatePath('/staff/approvals')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Credentials submission error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get pending submissions for staff approval
 */
export async function getPendingSubmissions() {
  const supabase = await createClient()
  
  try {
    // Get current user to verify staff access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Verify user is staff
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || !['staff', 'admin'].includes(userData.role)) {
      throw new Error('Staff access required')
    }
    
    // Fetch pending submissions with student and user information
    const { data: submissions, error } = await supabase
      .from('event_submissions')
      .select(`
        *,
        students!inner (
          id,
          users!inner (
            id,
            first_name,
            last_name,
            email
          ),
          companies (
            id,
            name
          )
        )
      `)
      .eq('approval_status', 'pending')
      .eq('needs_approval', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch pending submissions')
    }
    
    return { success: true, submissions: submissions || [] }
  } catch (error) {
    console.error('Pending submissions fetch error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message, submissions: [] }
    }
    
    return { success: false, error: 'An unexpected error occurred', submissions: [] }
  }
}

/**
 * Approve a submission and assign points
 */
export async function approveSubmission(
  submissionId: string,
  pointsGranted: number
) {
  const supabase = await createClient()
  
  try {
    // Get current user to use as approved_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Verify user is staff
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || !['staff', 'admin'].includes(userData.role)) {
      throw new Error('Staff access required')
    }
    
    // Update the submission
    const { data, error } = await supabase
      .from('event_submissions')
      .update({
        approval_status: 'approved',
        approved_by: user.id,
        points_granted: pointsGranted,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .eq('approval_status', 'pending') // Only approve pending submissions
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to approve submission')
    }
    
    if (!data) {
      throw new Error('Submission not found or already processed')
    }
    
    // Revalidate relevant pages
    revalidatePath('/staff/approvals')
    revalidatePath('/home')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Approval error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Reject a submission
 */
export async function rejectSubmission(
  submissionId: string,
  rejectionReason?: string
) {
  const supabase = await createClient()
  
  try {
    // Get current user to use as approved_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Verify user is staff
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || !['staff', 'admin'].includes(userData.role)) {
      throw new Error('Staff access required')
    }
    
    // Update the submission
    const { data, error } = await supabase
      .from('event_submissions')
      .update({
        approval_status: 'rejected',
        approved_by: user.id,
        points_granted: 0,
        notes: rejectionReason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .eq('approval_status', 'pending') // Only reject pending submissions
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to reject submission')
    }
    
    if (!data) {
      throw new Error('Submission not found or already processed')
    }
    
    // Revalidate relevant pages
    revalidatePath('/staff/approvals')
    revalidatePath('/home')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Rejection error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}