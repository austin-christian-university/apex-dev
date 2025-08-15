import type { Company, Student, User } from '@acu-apex/types'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateCompanyRank } from '@acu-apex/utils'

export interface CompanyMember {
  user: User
  student: Student
  holisticGPA: number // Placeholder - will be calculated from scores later
}

export interface CompanyDetails {
  company: Company
  members: CompanyMember[]
  memberCount: number
  holisticGPA: number // Company average from company_holistic_gpa table
  rank: number // Placeholder
  categoryBreakdown?: Record<string, number> // From company_holistic_gpa.category_breakdown
}

export interface CompanyStanding {
  companyId: string
  name: string
  score: number
  members: number
  rank: number
  trend?: number
}

/**
 * Fetch real company standings derived from latest company_holistic_gpa
 * - Uses latest record per company by calculation_date
 * - Includes member counts from students table
 * - Computes trend delta vs previous record (if available)
 */
export async function getCompanyStandings(
  supabaseClient?: SupabaseClient
): Promise<{ standings: CompanyStanding[]; error?: string }> {
  try {
    const supabase = supabaseClient || (await createClient())

    // 1) Active companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`)
    }

    const companyIds = (companies || []).map((c) => c.id)

    if (companyIds.length === 0) {
      return { standings: [] }
    }

    // 2) All GPA rows for these companies ordered by newest first
    const { data: gpaRows, error: gpaError } = await supabase
      .from('company_holistic_gpa')
      .select('company_id, holistic_gpa, calculation_date')
      .in('company_id', companyIds)
      .order('calculation_date', { ascending: false })

    if (gpaError) {
      throw new Error(`Failed to fetch company GPA: ${gpaError.message}`)
    }

    // Build latest and previous maps per company for trend
    const latestByCompany = new Map<string, { gpa: number; date: string }>()
    const previousByCompany = new Map<string, { gpa: number; date: string }>()

    for (const row of gpaRows || []) {
      const companyId = row.company_id as string
      const gpa = Number(row.holistic_gpa) || 0
      const date = String(row.calculation_date)
      if (!latestByCompany.has(companyId)) {
        latestByCompany.set(companyId, { gpa, date })
      } else if (!previousByCompany.has(companyId)) {
        previousByCompany.set(companyId, { gpa, date })
      }
    }

    // 3) Member counts per company (small N; fetch all and count client-side for reliability)
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, company_id')
      .in('company_id', companyIds)

    if (studentsError) {
      throw new Error(`Failed to fetch student counts: ${studentsError.message}`)
    }

    const memberCountByCompany = new Map<string, number>()
    for (const s of students || []) {
      const cid = s.company_id as string
      memberCountByCompany.set(cid, (memberCountByCompany.get(cid) || 0) + 1)
    }

    // Assemble standings entries
    const standingsUnranked = (companies || []).map((c) => {
      const latest = latestByCompany.get(c.id)
      const previous = previousByCompany.get(c.id)
      const score = latest ? Math.round(latest.gpa * 100) / 100 : 0
      const trend = latest && previous ? Math.round((latest.gpa - previous.gpa) * 100) / 100 : undefined
      return {
        companyId: c.id,
        name: c.name as string,
        score,
        members: memberCountByCompany.get(c.id) || 0,
        rank: 0, // filled below
        trend,
      } as CompanyStanding
    })

    // Compute ranks using shared util (descending by score)
    const rankMap = calculateCompanyRank(
      standingsUnranked.map((s) => ({ id: s.companyId, holisticGPA: s.score }))
    )

    const standingsRanked = standingsUnranked
      .map((s) => ({ ...s, rank: rankMap.get(s.companyId) || 0 }))
      .sort((a, b) => a.rank - b.rank)

    return { standings: standingsRanked }
  } catch (error) {
    console.error('Company standings fetch error:', error)
    return {
      standings: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
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

    // Fetch company holistic GPA data
    const { data: companyGPA, error: gpaError } = await supabase
      .from('company_holistic_gpa')
      .select('*')
      .eq('company_id', companyId)
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single()

    if (gpaError && gpaError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.warn('Failed to fetch company GPA data:', gpaError.message)
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
    
    // Use real company GPA data if available, otherwise fall back to member average
    const holisticGPA = companyGPA?.holistic_gpa || (memberCount > 0 
      ? companyMembers.reduce((sum, member) => sum + member.holisticGPA, 0) / memberCount
      : 0)

    const companyDetails: CompanyDetails = {
      company,
      members: companyMembers,
      memberCount,
      holisticGPA: Math.round(holisticGPA * 100) / 100, // Round to 2 decimal places
      rank: 1, // Placeholder - will be calculated relative to other companies
      categoryBreakdown: companyGPA?.category_breakdown || undefined
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