//Populi API is complicated, so we just disable the eslint rules for any on this file
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PopuliApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
}

async function makePopuliServerRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<PopuliApiResponse<T>> {
  const apiKey = process.env.POPULI_API_KEY
  const baseUrl = process.env.POPULI_URL

  if (!apiKey) {
    return { error: 'POPULI_API_KEY not configured' }
  }
  if (!baseUrl) {
    return { error: 'POPULI_URL not configured' }
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const url = `${cleanBaseUrl}/api2/${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${response.statusText}`, status: response.status }
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred', status: 500 }
  }
}

export async function getStudentEnrollmentsServer(personId: string, academicTermId?: string, expand?: string) {
  const params = new URLSearchParams()
  if (academicTermId) params.append('academic_term_id', academicTermId)
  if (expand) params.append('expand', expand)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return makePopuliServerRequest(`people/${personId}/enrollments${qs}`)
}

export async function getEnrollmentServer(enrollmentId: string) {
  return makePopuliServerRequest(`enrollments/${enrollmentId}`)
}

export async function getCourseOfferingServer(courseOfferingId: string) {
  return makePopuliServerRequest(`courseofferings/${courseOfferingId}`)
}

export async function getFinancialTransactionsServer(personId: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams()
  params.append('person_id', personId)
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  return makePopuliServerRequest(`financialtransactions?${params.toString()}`)
}

export async function getAcademicTermsServer() {
  return makePopuliServerRequest('academicterms')
}

export async function getPersonExpandedServer(personId: string, expand: string = 'student') {
  const params = expand ? `?expand=${encodeURIComponent(expand)}` : ''
  return makePopuliServerRequest(`people/${personId}${params}`)
}

export async function getStudentServer(personId: string) {
  return makePopuliServerRequest(`people/${personId}/student`)
}

export async function getTranscriptServer(personId: string, programId: string) {
  return makePopuliServerRequest(`people/${personId}/transcript?program_id=${programId}`)
}

export async function getPersonBalancesServer() {
  return makePopuliServerRequest('personbalances')
}

export async function getOnlinePaymentLinkServer(personId: string, forceRegenerate?: boolean) {
  const params = forceRegenerate ? '?force_regenerate=true' : ''
  return makePopuliServerRequest(`people/${personId}/onlinepaymentlink${params}`)
}

export async function searchPopuliPeopleServer(params: {
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
  return makePopuliServerRequest(endpoint)
}

/**
 * Server-side version of findBestPopuliPersonMatch - makes direct API calls
 * Advanced person matching with multiple strategies and confidence scoring
 */
export async function findBestPopuliPersonMatchServer(
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
    let result = await searchPopuliPeopleServer({ first_name: firstName, last_name: lastName })
    if (result.data?.data?.length > 0) {
      const nameMatch = result.data.data.find((person: any) => 
        person.first_name?.toLowerCase() === firstName.toLowerCase() &&
        person.last_name?.toLowerCase() === lastName.toLowerCase()
      )
      if (nameMatch) return { person: nameMatch, confidence: 'high', matchType: 'name_only' }
    }

    // Strategy 2: Email only match (high confidence)
    result = await searchPopuliPeopleServer({ email })
    if (result.data?.data?.length > 0) {
      const emailMatch = result.data.data.find((person: any) => 
        person.email?.toLowerCase() === email.toLowerCase()
      )
      if (emailMatch) return { person: emailMatch, confidence: 'high', matchType: 'email_only' }
    }

    // Strategy 3: Partial name matches (low confidence)
    result = await searchPopuliPeopleServer({ first_name: firstName })
    if (result.data?.data?.length > 0) {
      const partial1 = result.data.data.find((person: any) => 
        person.first_name?.toLowerCase() === firstName.toLowerCase() &&
        person.last_name?.toLowerCase().includes(lastName.toLowerCase())
      )
      if (partial1) return { person: partial1, confidence: 'low', matchType: 'partial_name' }
    }

    result = await searchPopuliPeopleServer({ last_name: lastName })
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
