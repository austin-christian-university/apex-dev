import type { OnboardingData, User, Student, Company } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/client'
import { clearOnboardingData } from './storage'

export interface SyncResult {
  success: boolean
  error?: string
}

/**
 * Sync onboarding data to Supabase USERS and STUDENTS tables
 */
export async function syncOnboardingDataToSupabase(
  onboardingData: OnboardingData,
  authUserId: string
): Promise<SyncResult> {
  try {
    const supabase = createClient()

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

    // If user is a student, also create/update student record
    if (onboardingData.role === 'student' && onboardingData.company_id) {
      const studentResult = await syncStudentData(authUserId, onboardingData.company_id)
      if (!studentResult.success) {
        throw new Error(`Failed to sync student data: ${studentResult.error}`)
      }
    }

    // Clear local storage after successful sync
    clearOnboardingData()

    return { success: true }
  } catch (error) {
    console.error('Onboarding sync error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Sync student-specific data to STUDENTS table
 */
async function syncStudentData(
  userId: string,
  companyId: string
): Promise<SyncResult> {
  try {
    const supabase = createClient()

    // Check if student record already exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('id')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing student: ${fetchError.message}`)
    }

    // Prepare student data (you can extend this with more fields as needed)
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
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(authUserId: string): Promise<{
  hasCompleted: boolean
  user?: Partial<User>
  error?: string
}> {
  try {
    const supabase = createClient()

    console.log('authUserId', authUserId)


    const { data: user, error } = await supabase
      .from('users')
      .select('id, has_completed_onboarding, role, first_name, last_name')
      .eq('id', authUserId)
      .single()


    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check onboarding status: ${error.message}`)
    }

    return {
      hasCompleted: user?.has_completed_onboarding ?? false,
      user: user || undefined
    }
  } catch (error) {
    console.error('Onboarding status check error:', error)
    return {
      hasCompleted: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Fetch available companies for selection
 */
export async function fetchCompanies(): Promise<{
  companies: Array<Company>
  error?: string
}> {
  try {
    const supabase = createClient()

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, description, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`)
    }

    return { companies: companies || [] }
  } catch (error) {
    console.error('Company fetch error:', error)
    return {
      companies: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get complete user profile (user + student data if applicable)
 */
export async function getUserProfile(authUserId: string): Promise<{
  profile?: any // You can type this more specifically based on your needs
  error?: string
}> {
  try {
    const supabase = createClient()

    // First get the user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user: ${userError.message}`)
    }

    // If user is a student, also fetch student and company data
    if (user.role === 'student') {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          companies (
            id,
            name,
            description,
            is_active
          )
        `)
        .eq('id', authUserId)
        .single()

      if (studentError) {
        throw new Error(`Failed to fetch student data: ${studentError.message}`)
      }

      return {
        profile: {
          user,
          student,
          company: student.companies
        }
      }
    }

    // For non-students, return just user data
    return { profile: { user } }
  } catch (error) {
    console.error('Profile fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}