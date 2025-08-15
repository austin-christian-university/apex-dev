import type { OnboardingData } from '@acu-apex/types'

const ONBOARDING_STORAGE_KEY = 'onboarding_data'

/**
 * Check if we're in a browser environment (not SSR)
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * Save onboarding data to localStorage
 */
export function saveOnboardingData(data: Partial<OnboardingData>): void {
  if (!isBrowser()) {
    console.warn('Cannot save onboarding data: localStorage not available (SSR)')
    return
  }
  
  try {
    const existingData = getOnboardingData()
    const updatedData = { ...existingData, ...data }
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    console.error('Failed to save onboarding data to localStorage:', error)
  }
}

/**
 * Get onboarding data from localStorage
 */
export function getOnboardingData(): Partial<OnboardingData> {
  if (!isBrowser()) {
    console.warn('Cannot read onboarding data: localStorage not available (SSR)')
    return {}
  }
  
  try {
    const data = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Failed to read onboarding data from localStorage:', error)
    return {}
  }
}

/**
 * Clear onboarding data from localStorage
 */
export function clearOnboardingData(): void {
  if (!isBrowser()) {
    console.warn('Cannot clear onboarding data: localStorage not available (SSR)')
    return
  }
  
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear onboarding data from localStorage:', error)
  }
}

/**
 * Check if onboarding data exists in localStorage
 */
export function hasOnboardingData(): boolean {
  if (!isBrowser()) {
    console.warn('Cannot check onboarding data: localStorage not available (SSR)')
    return false
  }
  
  try {
    const data = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return data !== null && data !== ''
  } catch (error) {
    console.error('Failed to check onboarding data in localStorage:', error)
    return false
  }
}

/**
 * Validate onboarding data completeness
 */
export function validateOnboardingData(data: Partial<OnboardingData>): {
  isValid: boolean
  missingFields: string[]
} {
  const requiredFields: (keyof OnboardingData)[] = [
    'role',
    'first_name', 
    'last_name',
    'email',
    'phone_number'
  ]

  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field]?.trim())) {
      missingFields.push(field)
    }
  }

  // Company is required for students and officers
  if ((data.role === 'student' || data.role === 'officer') && !data.company_id) {
    missingFields.push('company_id')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}