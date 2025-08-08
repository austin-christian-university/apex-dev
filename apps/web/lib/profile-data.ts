'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  User, 
  Student, 
  StudentHolisticGPA, 
  HolisticGPABreakdown, 
  PopuliAcademicRecord, 
  PopuliFinancialInfo, 
  RecentActivity,
  Company
} from '@acu-apex/types'
import { 
  getStudentEnrollmentsServer, 
  getPersonBalancesServer, 
  getPersonExpandedServer,
  getAcademicTermsServer,
  getEnrollmentServer,
  getCourseOfferingServer
} from '@/lib/populi-server'
import { extractTermShortName } from '@acu-apex/utils'

/**
 * Get student profile data including personal info, holistic GPA, recent activity, and Populi data
 */
export async function getStudentProfileData(userId: string): Promise<{
  user: User | null
  student: Student | null
  company: Company | null
  holisticGPA: StudentHolisticGPA | null
  recentActivity: RecentActivity[]
  populiData: {
    academic: PopuliAcademicRecord[] | null
    financial: PopuliFinancialInfo | null
    error?: string
  }
}> {
  const supabase = await createClient()

  try {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return {
        user: null,
        student: null,
        company: null,
        holisticGPA: null,
        recentActivity: [],
        populiData: { academic: null, financial: null, error: 'Failed to fetch user data' }
      }
    }

    // Get student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId)
      .single()

    if (studentError && studentError.code !== 'PGRST116') {
      console.error('Error fetching student:', studentError)
    }

    // Get company if student found
    let company: Company | null = null
    if (student?.company_id) {
      const { data: companyRow } = await supabase
        .from('companies')
        .select('*')
        .eq('id', student.company_id)
        .single()
      company = (companyRow as unknown as Company) || null
    }

    // Get holistic GPA data
    const holisticGPA = await getStudentHolisticGPA(userId)

    // Get recent activity
    const recentActivity = await getStudentRecentActivity(userId)

    // Get Populi data if user has populi_id
    let populiData: { academic: PopuliAcademicRecord[] | null; financial: PopuliFinancialInfo | null; error?: string } = { academic: null, financial: null }
    if (user.populi_id) {
      populiData = await getPopuliData(user.populi_id)
    }

    return {
      user,
      student: student || null,
      company,
      holisticGPA,
      recentActivity,
      populiData
    }

  } catch (error) {
    console.error('Error in getStudentProfileData:', error)
    return {
      user: null,
      student: null,
      company: null,
      holisticGPA: null,
      recentActivity: [],
      populiData: { academic: null, financial: null, error: 'Failed to fetch profile data' }
    }
  }
}

/**
 * Get student holistic GPA data
 */
async function getStudentHolisticGPA(userId: string): Promise<StudentHolisticGPA | null> {
  const supabase = await createClient()

  try {
    // Get holistic GPA
    const { data: holisticGPA, error: gpaError } = await supabase
      .from('student_holistic_gpa')
      .select('*')
      .eq('student_id', userId)
      .single()

    if (gpaError) {
      console.error('Error fetching holistic GPA:', gpaError)
      return null
    }

    if (!holisticGPA) return null

    // Get subcategory scores
    const { data: subcategoryScores, error: scoresError } = await supabase
      .from('student_subcategory_scores')
      .select(`
        *,
        subcategories (
          id,
          name,
          display_name,
          category_id,
          categories (
            id,
            name,
            display_name
          )
        )
      `)
      .eq('student_id', userId)

    if (scoresError) {
      console.error('Error fetching subcategory scores:', scoresError)
      return holisticGPA
    }

    // Organize scores by category
    const categoryBreakdown: Record<string, any> = {}
    
    if (subcategoryScores) {
      subcategoryScores.forEach((score: any) => {
        const category = score.subcategories?.categories
        if (category) {
          if (!categoryBreakdown[category.id]) {
            categoryBreakdown[category.id] = {
              category_id: category.id,
              category_name: category.name,
              category_display_name: category.display_name,
              category_score: 0,
              subcategories: []
            }
          }
          
          categoryBreakdown[category.id].subcategories.push({
            subcategory_id: score.subcategories.id,
            subcategory_name: score.subcategories.name,
            subcategory_display_name: score.subcategories.display_name,
            subcategory_score: Number(score.normalized_score) || 0
          })
        }
      })

      // Calculate category scores (average of subcategory normalized scores)
      Object.values(categoryBreakdown).forEach((category: any) => {
        if (category.subcategories.length > 0) {
          const totalScore = category.subcategories.reduce((sum: number, sub: any) => sum + (Number(sub.subcategory_score) || 0), 0)
          category.category_score = totalScore / category.subcategories.length
        }
      })
    }

    return {
      ...holisticGPA,
      category_breakdown: categoryBreakdown
    }

  } catch (error) {
    console.error('Error in getStudentHolisticGPA:', error)
    return null
  }
}

/**
 * Get student recent activity from event submissions
 */
async function getStudentRecentActivity(userId: string): Promise<RecentActivity[]> {
  const supabase = await createClient()

  try {
    const { data: submissions, error } = await supabase
      .from('event_submissions')
      .select(`
        id,
        submission_data,
        submitted_at,
        event_instances:event_id (
          id,
          name,
          description,
          event_type
        )
      `)
      .eq('student_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }

    return (submissions || []).map((submission: any) => ({
      id: submission.id,
      event_name: submission.event_instances?.name || 'Unknown Event',
      submission_type: submission.event_instances?.event_type || 'unknown',
      submitted_at: submission.submitted_at,
      description: submission.event_instances?.description || '',
      points_earned: undefined
    }))

  } catch (error) {
    console.error('Error in getStudentRecentActivity:', error)
    return []
  }
}

/**
 * Get Populi data (academic and financial) - UPDATED with correct endpoints
 */
async function getPopuliData(populiId: string): Promise<{
  academic: PopuliAcademicRecord[] | null
  financial: PopuliFinancialInfo | null
  error?: string
}> {
  try {
    // Ensure person exists
    const personResult = await getPersonExpandedServer(populiId, 'student')
    if (personResult.error || !personResult.data) {
      return { academic: null, financial: null, error: `Person data: ${personResult.error || 'Person not found'}` }
    }

    // Enrollments (non-expanded) and terms; we'll fetch offerings to ensure catalog course fields
    const enrollmentsResult = await getStudentEnrollmentsServer(populiId)

    // Fetch all balances and filter by person_id
    const balancesList = await getPersonBalancesServer()
    const personBalance = (Array.isArray((balancesList as any).data?.data)
      ? (balancesList as any).data.data.find((row: any) => String(row.person_id) === String(populiId))
      : null)

    // Fetch terms to map academic_term_id to human-readable names
    const termsResult = await getAcademicTermsServer()
    const termMap: Record<string, string> = {}
    const termSortKey: Record<string, number> = {}
    if (Array.isArray((termsResult as any).data?.data)) {
      ;(termsResult as any).data.data.forEach((t: any) => {
        if (t && t.id) {
          const idStr = String(t.id)
          const shortName = extractTermShortName(t.display_name) || t.display_name || t.name
          termMap[idStr] = shortName || idStr

          // Build a descending-friendly numeric key: year*10 + seasonOrder
          const seasonOrder: Record<string, number> = { winter: 1, spring: 2, summer: 3, fall: 4 }
          let key = Number(idStr) || 0
          if (shortName) {
            const match = String(shortName).match(/(Fall|Spring|Summer|Winter)\s+(\d{4})/i)
            if (match) {
              const season = match[1].toLowerCase()
              const year = Number(match[2]) || 0
              const ord = seasonOrder[season] ?? 0
              key = year * 10 + ord
            }
          }
          termSortKey[idStr] = key
        }
      })
    }

    // Academic processing with course names, codes (from catalog_courses), and letter grades
    let academic: PopuliAcademicRecord[] | null = null
    const enrollmentsArray = Array.isArray((enrollmentsResult as any).data?.data)
      ? (enrollmentsResult as any).data.data
      : Array.isArray(enrollmentsResult.data)
        ? enrollmentsResult.data
        : null

    if (enrollmentsArray) {
      // Optionally enrich enrollments with letter grades/credits where missing
      const enriched = await Promise.all(
        enrollmentsArray.map(async (en: any) => {
          if (en.final_grade == null || en.credits == null) {
            const d = await getEnrollmentServer(String(en.id))
            if (d.data) return { ...en, ...d.data }
          }
          return en
        })
      )

      // Fetch offerings for unique course_offering_id
      const uniqueOfferingIds = Array.from(new Set(
        enriched.map((en: any) => en.course_offering_id).filter(Boolean)
      ))
      const offeringMap: Record<string, any> = {}
      await Promise.all(uniqueOfferingIds.map(async (id: any) => {
        const o = await getCourseOfferingServer(String(id))
        const payload = (o as any).data?.data ?? o.data
        const offering = Array.isArray(payload) ? payload[0] : payload
        offeringMap[String(id)] = offering
      }))

      const termGroups: Record<string, any[]> = {}
      enriched.forEach((enrollment: any) => {
        const off = offeringMap[String(enrollment.course_offering_id)] || {}
        const termId = off?.academic_term_id ?? off?.term_id ?? enrollment.academic_term_id ?? null
        const termKey = termId ? String(termId) : 'Unknown Term'
        if (!termGroups[termKey]) termGroups[termKey] = []
        termGroups[termKey].push({ enrollment, offering: off })
      })

      const sortedEntries = Object.entries(termGroups).sort((a, b) => {
        const [termA] = a
        const [termB] = b
        const keyA = termSortKey[termA] ?? Number(termA) ?? 0
        const keyB = termSortKey[termB] ?? Number(termB) ?? 0
        return keyB - keyA // most recent first
      })

      academic = sortedEntries.map(([termId, rows]) => ({
        semester: termMap[termId] || termId,
        courses: (rows as any[]).map(({ enrollment, offering }) => {
          const catalogCourse = Array.isArray(offering?.catalog_courses) ? offering.catalog_courses[0] : undefined
          return {
            code: catalogCourse?.abbrv ?? offering?.abbrv ?? String(enrollment.course_offering_id || 'Unknown Code'),
            name: catalogCourse?.name ?? offering?.name ?? 'Unknown Course',
            grade: typeof enrollment.letter_grade === 'string'
              ? enrollment.letter_grade
              : (typeof enrollment.final_grade === 'number' ? `${Math.round(enrollment.final_grade)}%` : 'In Progress'),
            credits: enrollment.credits ?? offering?.credits ?? 0
          }
        }),
        gpa: calculateTermGPA((rows as any[]).map(r => r.enrollment))
      }))
    }

    // Financial processing (map person balance to UI fields)
    let financial: PopuliFinancialInfo | null = null
    if (personBalance) {
      financial = {
        tuition_balance: Number(personBalance.balance) || 0,
        financial_aid: 0,
        scholarships: 0,
        work_study: 0,
        status: 'Active',
        last_payment: undefined,
        next_due_date: undefined
      }
    }

    let error = undefined
    if (enrollmentsResult.error) error = `Academic data: ${enrollmentsResult.error}`
    if (balancesList.error) error = error ? `${error}; Financial data: ${balancesList.error}` : `Financial data: ${balancesList.error}`

    return { academic, financial, error }
  } catch (error) {
    console.error('Error fetching Populi data:', error)
    return { academic: null, financial: null, error: 'Failed to fetch Populi data' }
  }
}

/**
 * Calculate GPA for a term based on enrollments
 */
function calculateTermGPA(enrollments: any[]): number {
  let totalPoints = 0
  let totalCredits = 0

  enrollments.forEach(enrollment => {
    const grade = enrollment.final_grade
    const credits = enrollment.credits || 0

    if (grade && credits > 0) {
      const gradePoints = convertGradeToPoints(grade)
      totalPoints += gradePoints * credits
      totalCredits += credits
    }
  })

  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

/**
 * Convert letter grade to grade points
 */
function convertGradeToPoints(grade: string | number): number {
  if (typeof grade === 'number') return grade

  const gradeMap: Record<string, number> = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0,
    'F': 0.0
  }

  return gradeMap[grade.toUpperCase()] || 0
}

/**
 * Search for Populi person by name and email
 */
export async function searchPopuliPerson(firstName: string, lastName: string, email: string) {
  try {
    const { searchPopuliPeople } = await import('@/lib/populi')
    
    // Try multiple search strategies
    const searchStrategies = [
      // Exact match with all parameters
      { first_name: firstName, last_name: lastName, email },
      // Name only
      { first_name: firstName, last_name: lastName },
      // Email only
      { email },
      // Partial name match (if exact fails)
      { first_name: firstName },
      { last_name: lastName }
    ]

    for (const params of searchStrategies) {
      const result = await searchPopuliPeople(params)
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // Filter results to find best matches
        const matches = result.data.filter(person => {
          const firstNameMatch = !firstName || person.first_name?.toLowerCase().includes(firstName.toLowerCase())
          const lastNameMatch = !lastName || person.last_name?.toLowerCase().includes(lastName.toLowerCase())
          const emailMatch = !email || person.email?.toLowerCase() === email.toLowerCase()
          
          return firstNameMatch && lastNameMatch
        })

        if (matches.length > 0) {
          return {
            persons: matches.map(person => ({
              id: person.id,
              first_name: person.first_name,
              last_name: person.last_name,
              email: person.email,
              student_id: person.student_id,
              confidence: calculateMatchConfidence(person, firstName, lastName, email)
            })),
            error: null
          }
        }
      }
    }

    return {
      persons: [],
      error: null
    }
  } catch (error) {
    console.error('Error searching Populi:', error)
    return {
      persons: [],
      error: 'Failed to search Populi database'
    }
  }
}

/**
 * Calculate match confidence for Populi person search
 */
function calculateMatchConfidence(person: any, firstName: string, lastName: string, email: string): number {
  let score = 0
  let maxScore = 0

  // First name match
  if (firstName) {
    maxScore += 30
    if (person.first_name?.toLowerCase() === firstName.toLowerCase()) {
      score += 30
    } else if (person.first_name?.toLowerCase().includes(firstName.toLowerCase())) {
      score += 15
    }
  }

  // Last name match
  if (lastName) {
    maxScore += 30
    if (person.last_name?.toLowerCase() === lastName.toLowerCase()) {
      score += 30
    } else if (person.last_name?.toLowerCase().includes(lastName.toLowerCase())) {
      score += 15
    }
  }

  // Email match
  if (email) {
    maxScore += 40
    if (person.email?.toLowerCase() === email.toLowerCase()) {
      score += 40
    }
  }

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}

/**
 * Link user to Populi person
 */
export async function linkUserToPopuli(userId: string, populiId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .update({ populi_id: populiId })
      .eq('id', userId)

    if (error) {
      return { error: `Failed to link user to Populi: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error linking user to Populi:', error)
    return { error: 'Failed to link user to Populi' }
  }
}
