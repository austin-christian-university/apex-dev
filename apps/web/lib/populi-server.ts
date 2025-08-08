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
