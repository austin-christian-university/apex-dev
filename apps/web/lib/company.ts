import type { Company, Student, User } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface CompanyMember {
  user: User
  student: Student
  holisticGPA: number // Placeholder - will be calculated from scores later
}

export interface CompanyDetails {
  company: Company
  members: CompanyMember[]
  memberCount: number
  holisticGPA: number // Company average
  rank: number // Placeholder
}

/**
 * Fetch complete company information including members
 */
export async function getCompanyDetails(
  companyId: string,
  supabaseClient?: SupabaseClient
): Promise<{
  companyDetails?: CompanyDetails
  error?: string
}> {
  try {
    const supabase = supabaseClient || await createClient()

    // Fetch company information
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('is_active', true)
      .single()

    if (companyError) {
      throw new Error(`Failed to fetch company: ${companyError.message}`)
    }

    if (!company) {
      throw new Error('Company not found')
    }

    // Fetch company members with their user data
    const { data: members, error: membersError } = await supabase
      .from('students')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          phone_number,
          photo,
          role
        )
      `)
      .eq('company_id', companyId)

    if (membersError) {
      throw new Error(`Failed to fetch company members: ${membersError.message}`)
    }

    // Transform and calculate member data
    const companyMembers: CompanyMember[] = (members || []).map(member => {
      // Handle the case where users might be an array or single object
      const userData = Array.isArray(member.users) ? member.users[0] : member.users
      
      if (!userData) {
        console.warn('No user data for member:', member.id)
        return null
      }
      
      return {
        user: userData as User,
        student: {
          id: member.id,
          company_id: member.company_id,
          academic_role: member.academic_role,
          company_role: member.company_role,
          academic_year_start: member.academic_year_start,
          academic_year_end: member.academic_year_end,
          created_at: member.created_at,
          updated_at: member.updated_at,
          student_id: member.student_id
        },
        // Placeholder GPA calculation - will be implemented with scoring system
        holisticGPA: 3.50 + Math.random() * 0.5 // Random between 3.50-4.00 for now
      }
    }).filter(Boolean) as CompanyMember[]

    // Calculate company-wide metrics
    const memberCount = companyMembers.length
    const holisticGPA = memberCount > 0 
      ? companyMembers.reduce((sum, member) => sum + member.holisticGPA, 0) / memberCount
      : 0

    const companyDetails: CompanyDetails = {
      company,
      members: companyMembers,
      memberCount,
      holisticGPA: Math.round(holisticGPA * 100) / 100, // Round to 2 decimal places
      rank: 1 // Placeholder - will be calculated relative to other companies
    }

    return { companyDetails }
  } catch (error) {
    console.error('Company details fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get the current user's company information
 */
export async function getCurrentUserCompany(
  userId: string,
  supabaseClient?: SupabaseClient
): Promise<{
  companyDetails?: CompanyDetails
  error?: string
}> {
  try {
    const supabase = supabaseClient || await createClient()

    // First, get the user's company_id from the students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (studentError) {
      throw new Error(`Failed to fetch student data: ${studentError.message}`)
    }

    if (!student?.company_id) {
      throw new Error('User is not assigned to a company')
    }

    // Fetch complete company details
    return await getCompanyDetails(student.company_id, supabase)
  } catch (error) {
    console.error('Current user company fetch error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get all companies for comparison/ranking
 */
export async function getAllCompanies(
  supabaseClient?: SupabaseClient
): Promise<{
  companies: Company[]
  error?: string
}> {
  try {
    const supabase = supabaseClient || await createClient()

    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`)
    }

    return { companies: companies || [] }
  } catch (error) {
    console.error('Companies fetch error:', error)
    return {
      companies: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}