'use server'

import { createClient } from '@/lib/supabase/server'
import { AttendanceSubmissionSchema, type AttendanceSubmission } from '@acu-apex/types'
import { revalidatePath } from 'next/cache'

/**
 * Submit attendance for an event
 */
export async function submitAttendance(
  eventId: string,
  studentId: string,
  submissionData: AttendanceSubmission
) {
  const supabase = await createClient()
  
  try {
    // Validate the submission data
    const validatedData = AttendanceSubmissionSchema.parse(submissionData)
    
    // Get current user to use as submitted_by
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }
    
    // Check if student already submitted attendance for this event
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
      throw new Error('Attendance already submitted for this event')
    }
    
    // Submit attendance
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: eventId,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to submit attendance')
    }
    
    // Revalidate the home page to show updated data
    revalidatePath('/home')
    
    return { success: true, submission: data }
  } catch (error) {
    console.error('Attendance submission error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Check if student has already submitted attendance for an event
 */
export async function hasSubmittedAttendance(
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
    console.error('Error checking attendance submission:', error)
    return false
  }
  
  return !!data
}

/**
 * Get attendance submission for an event
 */
export async function getAttendanceSubmission(
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
    console.error('Error getting attendance submission:', error)
    return null
  }
  
  return data
} 