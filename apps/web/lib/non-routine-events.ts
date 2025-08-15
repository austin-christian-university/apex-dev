'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  CommunityServiceSubmissionSchema, 
  JobPromotionSubmissionSchema, 
  CredentialsSubmissionSchema,
  TeamParticipationSubmissionSchema,
  type CommunityServiceSubmission, 
  type JobPromotionSubmission, 
  type CredentialsSubmission,
  type TeamParticipationSubmission
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
    
    // Create a private event instance first
    const { data: createdEvent, error: createEventError } = await supabase
      .from('event_instances')
      .insert([
        {
          name: 'Community Service Submission',
          description: 'Student self-reported community service event',
          event_type: 'self_report',
          required_roles: null,
          required_years: null,
          class_code: null,
          due_date: null,
          is_active: true,
          show_on_homepage: false,
          created_by: user.id,
          recurring_event_id: null,
          required_company: null,
          // subcategory: community_service_hours
          subcategory_id: (await (async () => {
            const { data: sc } = await supabase
              .from('subcategories')
              .select('id, name')
              .eq('name', 'community_service_hours')
              .single()
            return sc?.id || null
          })()),
        },
      ])
      .select()
      .single()

    if (createEventError) {
      throw new Error('Failed to create event instance')
    }

    // Submit the non-routine event referencing the new event instance
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: createdEvent.id,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null,
        subcategory_id: createdEvent.subcategory_id,
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
    
    // Create a private event instance first
    const { data: createdEvent, error: createEventError } = await supabase
      .from('event_instances')
      .insert([
        {
          name: 'Job Promotion Submission',
          description: 'Student self-reported job promotion event',
          event_type: 'self_report',
          required_roles: null,
          required_years: null,
          class_code: null,
          due_date: null,
          is_active: true,
          show_on_homepage: false,
          created_by: user.id,
          recurring_event_id: null,
          required_company: null,
          // subcategory: job_promotion_opportunities
          subcategory_id: (await (async () => {
            const { data: sc } = await supabase
              .from('subcategories')
              .select('id, name')
              .eq('name', 'job_promotion_opportunities')
              .single()
            return sc?.id || null
          })()),
        },
      ])
      .select()
      .single()

    if (createEventError) {
      throw new Error('Failed to create event instance')
    }

    // Submit the non-routine event referencing the new event instance
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: createdEvent.id,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null,
        subcategory_id: createdEvent.subcategory_id,
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
    
    // Create a private event instance first
    const { data: createdEvent, error: createEventError } = await supabase
      .from('event_instances')
      .insert([
        {
          name: 'Credentials Submission',
          description: 'Student self-reported credential/certification event',
          event_type: 'self_report',
          required_roles: null,
          required_years: null,
          class_code: null,
          due_date: null,
          is_active: true,
          show_on_homepage: false,
          created_by: user.id,
          recurring_event_id: null,
          required_company: null,
          // subcategory: credentials_certifications
          subcategory_id: (await (async () => {
            const { data: sc } = await supabase
              .from('subcategories')
              .select('id, name')
              .eq('name', 'credentials_certifications')
              .single()
            return sc?.id || null
          })()),
        },
      ])
      .select()
      .single()

    if (createEventError) {
      throw new Error('Failed to create event instance')
    }

    // Submit the non-routine event referencing the new event instance
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: createdEvent.id,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null,
        subcategory_id: createdEvent.subcategory_id,
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
 * Submit a team participation event
 */
export async function submitTeamParticipationEvent(
  studentId: string,
  submissionData: TeamParticipationSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data
    const validatedData = TeamParticipationSubmissionSchema.parse(submissionData)
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Determine the correct subcategory based on team type
    const subcategoryName = validatedData.team_type === 'fellow_friday_team' 
      ? 'fellow_friday_participation'
      : 'chapel_participation'
    
    // Look up the subcategory ID first
    const { data: subcategoryData, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('id, name')
      .eq('name', subcategoryName)
      .single()
    
    if (subcategoryError || !subcategoryData) {
      throw new Error(`Subcategory '${subcategoryName}' not found`)
    }
    
    // Create a private event instance
    const { data: createdEvent, error: createEventError } = await supabase
      .from('event_instances')
      .insert([
        {
          name: `${validatedData.team_type === 'fellow_friday_team' ? 'Fellow Friday Team' : 'Chapel Team'} Participation Submission`,
          description: 'Student self-reported team participation event',
          event_type: 'optional_team_participation',
          required_roles: null,
          required_years: null,
          class_code: null,
          due_date: null,
          is_active: true,
          show_on_homepage: false,
          created_by: user.id,
          recurring_event_id: null,
          required_company: null,
          subcategory_id: subcategoryData.id,
        },
      ])
      .select()
      .single()

    if (createEventError) {
      throw new Error('Failed to create event instance')
    }

    // Submit the team participation event referencing the new event instance
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: createdEvent.id,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        needs_approval: true,
        approval_status: 'pending',
        approved_by: null,
        points_granted: null,
        subcategory_id: createdEvent.subcategory_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit team participation event')
    }

    // Revalidate relevant pages
    revalidatePath('/home')
    revalidatePath('/staff/approvals')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Team participation submission error:', error)
    
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
    
    // Use RPC function for efficient data fetching
    const { data: submissions, error } = await supabase.rpc('get_pending_submissions_with_details')
    
    if (error) {
      console.error('RPC function failed, falling back to manual approach:', error)
      return await getPendingSubmissionsManual(supabase)
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
 * Manual fallback for getting pending submissions when RPC is not available
 */
async function getPendingSubmissionsManual(supabase: any) {
  try {
    // Get pending submissions first
    const { data: submissions, error: submissionsError } = await supabase
      .from('event_submissions')
      .select(`
        id,
        event_id,
        student_id,
        submitted_by,
        submission_data,
        submitted_at,
        subcategory_id,
        needs_approval,
        approval_status
      `)
      .eq('approval_status', 'pending')
      .eq('needs_approval', true)
      .order('submitted_at', { ascending: false })
    
    if (submissionsError) {
      throw new Error('Failed to fetch submissions')
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, submissions: [] }
    }

    // Get unique student IDs
    const studentIds = [...new Set(submissions.map((sub: any) => sub.student_id))]
    
    // Get student data with company information
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        company_id,
        academic_role,
        company_role,
        companies (
          id,
          name
        )
      `)
      .in('id', studentIds)
    
    if (studentsError) {
      throw new Error('Failed to fetch student data')
    }

    // Get user data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, photo')
      .in('id', studentIds)
    
    if (usersError) {
      throw new Error('Failed to fetch user data')
    }

    // Get unique event IDs
    const eventIds = [...new Set(submissions.map((sub: any) => sub.event_id))]
    
    // Get event instance data
    const { data: eventInstances, error: eventsError } = await supabase
      .from('event_instances')
      .select('id, name, description, event_type')
      .in('id', eventIds)
    
    if (eventsError) {
      throw new Error('Failed to fetch event instances')
    }

    // Create lookup maps
    const studentsMap = new Map(students?.map((s: any) => [s.id, s]) || [])
    const usersMap = new Map(users?.map((u: any) => [u.id, u]) || [])
    const eventsMap = new Map(eventInstances?.map((e: any) => [e.id, e]) || [])

    // Combine all data
    const enrichedSubmissions = submissions.map((submission: any) => {
      const student: any = studentsMap.get(submission.student_id)
      const user = usersMap.get(submission.student_id)
      const eventInstance = eventsMap.get(submission.event_id)

      return {
        ...submission,
        students: student ? {
          ...student,
          // student.companies is an array from nested query, take first element
          companies: Array.isArray(student.companies) ? student.companies[0] : student.companies,
          users: user || null
        } : null,
        event_instances: eventInstance || null
      }
    }).filter((submission: any) => submission.students) // Only include submissions with valid student data
    
    return { success: true, submissions: enrichedSubmissions }
  } catch (error) {
    console.error('Manual fetch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred', 
      submissions: [] 
    }
  }
}

/**
 * Approve a submission and assign points
 */
export async function approveSubmission(
  submissionId: string,
  pointsGranted: number,
  approvalNotes?: string
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
    
    // Get the current submission to update the submission_data with assigned points if needed
    const { data: currentSubmission, error: fetchError } = await supabase
      .from('event_submissions')
      .select('submission_data')
      .eq('id', submissionId)
      .single()
    
    if (fetchError || !currentSubmission) {
      throw new Error('Submission not found')
    }
    
    let updatedSubmissionData = currentSubmission.submission_data
    
    // For job promotion and credentials submissions, update the submission_data with assigned_points
    if (updatedSubmissionData?.submission_type === 'job_promotion' || 
        updatedSubmissionData?.submission_type === 'credentials') {
      updatedSubmissionData = {
        ...updatedSubmissionData,
        assigned_points: pointsGranted
      }
    }
    
    // Update the submission
    const { data, error } = await supabase
      .from('event_submissions')
      .update({
        approval_status: 'approved',
        approved_by: user.id,
        points_granted: pointsGranted,
        approval_notes: approvalNotes || null,
        submission_data: updatedSubmissionData,
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
        approval_notes: rejectionReason || null,
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