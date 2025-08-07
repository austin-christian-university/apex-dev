import { NextRequest, NextResponse } from 'next/server'

interface PopuliApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
}

async function makePopuliRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PopuliApiResponse<T>> {
  const apiKey = process.env.POPULI_API_KEY
  const baseUrl = process.env.POPULI_URL

  if (!apiKey) {
    return { error: 'POPULI_API_KEY not configured' }
  }

  if (!baseUrl) {
    return { error: 'POPULI_URL not configured' }
  }

  // Clean up the URL - remove trailing slash and ensure proper format
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
    })

    if (!response.ok) {
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const limit = searchParams.get('limit')

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint parameter is required' },
      { status: 400 }
    )
  }

  // Build the full endpoint with query parameters
  let fullEndpoint = endpoint
  if (limit) {
    const separator = endpoint.includes('?') ? '&' : '?'
    fullEndpoint = `${endpoint}${separator}limit=${limit}`
  }

  const result = await makePopuliRequest(fullEndpoint)
  
  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status || 500 }
    )
  }

  return NextResponse.json(result.data)
} 