//Populi API is complicated, so we just disable the eslint rules for any on this file
/* eslint-disable @typescript-eslint/no-explicit-any */

interface PopuliApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
}

async function makePopuliRequest<T = any>(endpoint: string): Promise<PopuliApiResponse<T>> {
  try {
    const response = await fetch(`/api/populi?endpoint=${encodeURIComponent(endpoint)}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    }
  }
}

export async function getPopuliPeople() {
  return makePopuliRequest('people')
}

export async function getPopuliPerson(personId: string) {
  return makePopuliRequest(`people/${personId}`)
}

export async function getPopuliStudents() {
  return makePopuliRequest('students')
}

export async function getPopuliCourses() {
  return makePopuliRequest('courses')
}

export async function searchPopuliPeople(params: {
  first_name?: string
  last_name?: string
  email?: string
  student_id?: string
}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value)
    }
  })
  
  const endpoint = searchParams.toString() ? `people?${searchParams.toString()}` : 'people'
  return makePopuliRequest(endpoint)
}

/**
 * Advanced person matching with multiple strategies and confidence scoring
 */
export async function findBestPopuliPersonMatch(
  firstName: string,
  lastName: string,
  email: string,

): Promise<{
  person: any | null
  confidence: 'high' | 'medium' | 'low' | null
  matchType: 'name_only' | 'email_only' | 'phone_only' | 'partial_name' | null
  error?: string
}> {
  try {
    // Strategy 1: Full name match (high confidence)
    let result = await searchPopuliPeople({ first_name: firstName, last_name: lastName })
    if (result.data?.data?.length > 0) {
      const nameMatch = result.data.data.find((person: any) => 
        person.first_name?.toLowerCase() === firstName.toLowerCase() &&
        person.last_name?.toLowerCase() === lastName.toLowerCase()
      )
      if (nameMatch) return { person: nameMatch, confidence: 'high', matchType: 'name_only' }
    }

    // Strategy 2: Email only match (high confidence)
    result = await searchPopuliPeople({ email })
    if (result.data?.data?.length > 0) {
      const emailMatch = result.data.data.find((person: any) => 
        person.email?.toLowerCase() === email.toLowerCase()
      )
      if (emailMatch) return { person: emailMatch, confidence: 'high', matchType: 'email_only' }
    }

    // Strategy 4: Partial name matches (low confidence)
    result = await searchPopuliPeople({ first_name: firstName })
    if (result.data?.data?.length > 0) {
      const partial1 = result.data.data.find((person: any) => 
        person.first_name?.toLowerCase() === firstName.toLowerCase() &&
        person.last_name?.toLowerCase().includes(lastName.toLowerCase())
      )
      if (partial1) return { person: partial1, confidence: 'low', matchType: 'partial_name' }
    }

    result = await searchPopuliPeople({ last_name: lastName })
    if (result.data?.data?.length > 0) {
      const partial2 = result.data.data.find((person: any) => 
        person.last_name?.toLowerCase() === lastName.toLowerCase() &&
        person.first_name?.toLowerCase().includes(firstName.toLowerCase())
      )
      if (partial2) return { person: partial2, confidence: 'low', matchType: 'partial_name' }
    }

    return { person: null, confidence: null, matchType: null }
  } catch (error) {
    return {
      person: null,
      confidence: null,
      matchType: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getPopuliPersonByStudentId(studentId: string) {
  return makePopuliRequest(`people/by_student_id/${studentId}`)
}

export async function getPopuliStudentEnrollments(personId: string, academicTermId?: string) {
  const params = academicTermId ? `?academic_term_id=${academicTermId}` : ''
  return makePopuliRequest(`people/${personId}/enrollments${params}`)
}

// Enrollments with expand support (e.g., expand=courseoffering)
export async function getPopuliStudentEnrollmentsExpanded(
  personId: string,
  expand?: string,
  academicTermId?: string
) {
  const searchParams = new URLSearchParams()
  if (academicTermId) searchParams.append('academic_term_id', academicTermId)
  if (expand) searchParams.append('expand', expand)
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return makePopuliRequest(`people/${personId}/enrollments${qs}`)
}

// Fetch a single course offering (to inspect fields like academic_term_id)
export async function getPopuliCourseOffering(courseOfferingId: string) {
  return makePopuliRequest(`courseofferings/${courseOfferingId}`)
}



// FIX: Person-only balances endpoint
export async function getPopuliStudentBalance(personId: string) {
  const result = await makePopuliRequest('personbalances')
  if (result.error) return result

  const list = (result as any).data
  const dataArray = Array.isArray(list?.data) ? list.data : []
  const match = dataArray.find((row: any) => String(row.person_id) === String(personId))
  return { data: match ?? null, status: result.status }
}

export async function getPopuliAcademicTerms() {
  return makePopuliRequest('academicterms')
}


export async function callPopuliEndpoint(endpoint: string) {
  return makePopuliRequest(endpoint)
}

// Restore helpers used by test page
export async function getPopuliStudent(personId: string) {
  return makePopuliRequest(`people/${personId}/student`)
}

export async function getPopuliPersonBalances() {
  return makePopuliRequest('personbalances')
}

export async function getPopuliOnlinePaymentLink(personId: string, forceRegenerate?: boolean) {
  const params = forceRegenerate ? '?force_regenerate=true' : ''
  return makePopuliRequest(`people/${personId}/onlinepaymentlink${params}`)
} 