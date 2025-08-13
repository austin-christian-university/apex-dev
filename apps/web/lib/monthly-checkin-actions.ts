'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  SmallGroupMonthlyCheckSubmissionSchema, 
  DreamTeamMonthlyCheckSubmissionSchema,
  type SmallGroupMonthlyCheckSubmission,
  type DreamTeamMonthlyCheckSubmission
} from '@acu-apex/types'
import { revalidatePath } from 'next/cache'

/**
 * Submit monthly check-in for an event
 */
export async function submitMonthlyCheckin(
  eventId: string,
  studentId: string,
  submissionData: SmallGroupMonthlyCheckSubmission | DreamTeamMonthlyCheckSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data based on type
    let validatedData
    if (submissionData.submission_type === 'small_group') {
      validatedData = SmallGroupMonthlyCheckSubmissionSchema.parse(submissionData)
    } else if (submissionData.submission_type === 'dream_team') {
      validatedData = DreamTeamMonthlyCheckSubmissionSchema.parse(submissionData)
    } else {
      throw new Error('Invalid submission type for monthly check-in')
    }
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Check if student already submitted for this event
    const { data: existingSubmission, error: checkError } = await supabase
      .from('event_submissions')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error('Failed to check existing submissions')
    }
    
    if (existingSubmission) {
      throw new Error('Monthly check-in already submitted for this event')
    }
    
    // Get the event to find the subcategory_id
    const { data: eventData, error: eventError } = await supabase
      .from('event_instances')
      .select('subcategory_id')
      .eq('id', eventId)
      .single()
    
    if (eventError || !eventData) {
      throw new Error('Event not found')
    }
    
    // Submit monthly check-in
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: eventId,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData,
        subcategory_id: eventData.subcategory_id,
        needs_approval: false, // Monthly check-ins don't need approval
        approval_status: 'approved',
        approval_notes: 'auto-approval for monthly check-in'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit monthly check-in')
    }
    
    // Revalidate the home page to show updated data
    revalidatePath('/home')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Monthly check-in submission error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Check if student has already submitted monthly check-in for an event
 */
export async function hasSubmittedMonthlyCheckin(
  eventId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('event_submissions')
    .select('id')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking monthly check-in submission:', error)
    return false
  }
  
  return !!data
}

/**
 * Get monthly check-in submission for an event
 */
export async function getMonthlyCheckinSubmission(
  eventId: string,
  studentId: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('event_id', eventId)
    .eq('student_id', studentId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error getting monthly check-in submission:', error)
    return null
  }
  
  return data
}
