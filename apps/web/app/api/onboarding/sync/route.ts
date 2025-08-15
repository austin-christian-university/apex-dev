import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { findBestPopuliPersonMatchServer } from '@/lib/populi-server'
import type { User, Student } from '@acu-apex/types'

export interface SyncResult {
  success: boolean
  error?: string
}

export interface PopuliSyncResult {
  success: boolean
  populiId?: string
  confidence?: 'high' | 'medium' | 'low'
  matchType?: string
  error?: string
}

/**
 * POST /api/onboarding/sync
 * Sync onboarding data to database using service role (bypasses RLS)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { onboardingData, authUserId } = body

    if (!onboardingData || !authUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: onboardingData and authUserId' },
        { status: 400 }
      )
    }

    // Verify the user is authenticated by checking with regular client
    const regularClient = await createClient()
    const { data: authUser, error: authError } = await regularClient.auth.getUser()
    
    if (authError || !authUser.user || authUser.user.id !== authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS for onboarding
    const supabase = createServiceRoleClient()

    // Prepare user data for database (matching actual schema)
    const userData: Partial<User> = {
      id: authUserId,
      first_name: onboardingData.first_name,
      last_name: onboardingData.last_name,
      email: onboardingData.email,
      phone_number: onboardingData.phone_number,
      date_of_birth: onboardingData.date_of_birth || null,
      photo: onboardingData.photo || null,
      role: onboardingData.role,
      disc_profile: onboardingData.disc_profile || null,
      myers_briggs_profile: onboardingData.myers_briggs_profile || null,
      enneagram_profile: onboardingData.enneagram_profile || null,
      has_completed_onboarding: true,
      updated_at: new Date().toISOString()
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      throw new Error(`Failed to check existing user: ${fetchError.message}`)
    }

    let result
    if (existingUser) {
      // Update existing user
      result = await supabase
        .from('users')
        .update(userData)
        .eq('id', authUserId)
    } else {
      // Insert new user
      result = await supabase
        .from('users')
        .insert([{ ...userData, created_at: new Date().toISOString() }])
    }

    if (result.error) {
      throw new Error(`Failed to sync user data: ${result.error.message}`)
    }

    // Try to link user to Populi person (don't fail if this doesn't work)
    let populiSyncResult: PopuliSyncResult | undefined
    try {
      populiSyncResult = await attemptPopuliLinking(
        authUserId, 
        onboardingData.first_name, 
        onboardingData.last_name, 
        onboardingData.email,
        onboardingData.phone_number,
        supabase
      )
    } catch (error) {
      console.warn('Failed to link user to Populi during onboarding:', error)
      populiSyncResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }

    // If user is a student or officer, also create/update student record
    if ((onboardingData.role === 'student' || onboardingData.role === 'officer') && onboardingData.company_id) {
      const studentResult = await syncStudentData(authUserId, onboardingData.company_id, supabase)
      if (!studentResult.success) {
        throw new Error(`Failed to sync student data: ${studentResult.error}`)
      }
    }

    return NextResponse.json({ 
      success: true,
      populiSync: populiSyncResult
    })

  } catch (error) {
    console.error('Onboarding sync API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * Sync student-specific data to STUDENTS table
 */
async function syncStudentData(
  userId: string,
  companyId: string,
  supabase: SupabaseClient
): Promise<SyncResult> {
  try {
    // Check if student record already exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('id')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing student: ${fetchError.message}`)
    }

    // Prepare student data
    const studentData: Partial<Student> = {
      id: userId,
      company_id: companyId,
      academic_year_start: new Date().getFullYear(),
      academic_year_end: new Date().getFullYear() + 1,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingStudent) {
      // Update existing student
      result = await supabase
        .from('students')
        .update(studentData)
        .eq('id', userId)
    } else {
      // Insert new student
      result = await supabase
        .from('students')
        .insert([{ ...studentData, created_at: new Date().toISOString() }])
    }

    if (result.error) {
      throw new Error(`Failed to sync student data: ${result.error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Student sync error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Attempt to link user to Populi person during onboarding
 */
async function attemptPopuliLinking(
  userId: string, 
  firstName: string, 
  lastName: string, 
  email: string,
  phoneNumber: string | undefined,
  supabase: SupabaseClient
): Promise<PopuliSyncResult> {
  try {
    console.log(`Attempting to find Populi match for user: ${firstName} ${lastName} (${email})`)
    console.log('Populi matching parameters:', { firstName, lastName, email, phoneNumber })
    
    const matchResult = await findBestPopuliPersonMatchServer(firstName, lastName, email, phoneNumber)
    console.log('Populi match result:', { 
      person: matchResult.person ? { id: matchResult.person.id, name: `${matchResult.person.first_name} ${matchResult.person.last_name}` } : null,
      confidence: matchResult.confidence,
      matchType: matchResult.matchType,
      error: matchResult.error 
    })
    
    if (matchResult.error) {
      console.warn('Populi search failed:', matchResult.error)
      return {
        success: false,
        error: matchResult.error
      }
    }

    if (matchResult.person && matchResult.confidence) {
      console.log(`Found Populi match with ${matchResult.confidence} confidence (${matchResult.matchType})`)
      
      // Auto-link if confidence is high, otherwise return info for user decision
      if (matchResult.confidence === 'high') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ populi_id: matchResult.person.id })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to update user with Populi ID:', updateError)
          return {
            success: false,
            error: `Found Populi match but failed to save: ${updateError.message}`
          }
        }

        console.log(`Successfully linked user ${userId} to Populi person ${matchResult.person.id}`)
        return {
          success: true,
          populiId: matchResult.person.id,
          confidence: matchResult.confidence,
          matchType: matchResult.matchType || 'unknown'
        }
      } else {
        // Low confidence - don't auto-link but report the finding
        console.log(`Found potential Populi match with ${matchResult.confidence} confidence. Manual review recommended.`)
        return {
          success: false,
          populiId: matchResult.person.id,
          confidence: matchResult.confidence,
          matchType: matchResult.matchType || 'unknown',
          error: `Found potential match with ${matchResult.confidence} confidence - manual review needed`
        }
      }
    } else {
      console.log('No Populi person found matching user data')
      return {
        success: false,
        error: 'No matching person found in Populi'
      }
    }
  } catch (error) {
    console.error('Error during Populi linking attempt:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during Populi sync'
    }
  }
}
