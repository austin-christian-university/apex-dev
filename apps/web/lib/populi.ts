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