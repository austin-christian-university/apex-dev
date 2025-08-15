'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GBEParticipationSubmission, CompanyTeamBuildingSubmission } from '@acu-apex/types'

interface ParticipationScore {
  studentId: string
  score: number
}

/**
 * Submit participation scores for a team participation event
 * This creates individual submissions for each team member
 */
export async function submitParticipationScoresAction(
  eventId: string,
  participationScores: ParticipationScore[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get the event details to determine the subcategory
    const { data: event, error: eventError } = await supabase
      .from('event_instances')
      .select('id, name, subcategory_id, required_company')
      .eq('id', eventId)
      .single()

    if (eventError) {
      throw new Error(`Failed to fetch event: ${eventError.message}`)
    }

    if (!event.subcategory_id) {
      throw new Error('Event must have a subcategory ID')
    }

    // Determine the submission type based on subcategory
    let submissionType: 'gbe_participation' | 'company_team_building'
    if (event.subcategory_id === '0ceea111-1485-4a80-98a9-d82f3c12321c') {
      submissionType = 'gbe_participation'
    } else if (event.subcategory_id === '78606cf2-7866-4ed5-8384-1e464a0b5d66') {
      submissionType = 'company_team_building'
    } else {
      throw new Error('Invalid subcategory for participation event')
    }

    // Get the current user for the submitted_by field
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Create submissions for each team member
    const submissionPromises = participationScores.map(async ({ studentId, score }) => {
      // Create the submission data based on type
      let submissionData: GBEParticipationSubmission | CompanyTeamBuildingSubmission
      
      if (submissionType === 'gbe_participation') {
        submissionData = {
          submission_type: 'gbe_participation',
          points: score,
          notes: `Participation score submitted for ${event.name}`
        }
      } else {
        submissionData = {
          submission_type: 'company_team_building', 
          points: score,
          notes: `Team building score submitted for ${event.name}`
        }
      }

      // Insert the submission
      return supabase
        .from('event_submissions')
        .insert({
          event_id: eventId,
          student_id: studentId,
          submitted_by: user.id,
          subcategory_id: event.subcategory_id,
          submission_data: submissionData,
          needs_approval: false, // Auto-approve participation submissions as per requirements
          approval_status: 'approved',
          points_granted: score
        })
    })

    // Execute all submissions
    const results = await Promise.all(submissionPromises)
    
    // Check for any errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      throw new Error(`Failed to submit ${errors.length} scores: ${errors[0].error?.message}`)
    }

    // Revalidate the home page to update the UI
    revalidatePath('/home')
    revalidatePath('/(student)/home')

    return { 
      success: true 
    }
  } catch (error) {
    console.error('Error submitting participation scores:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}
