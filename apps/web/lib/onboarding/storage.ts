import type { OnboardingData } from '@acu-apex/types'

const ONBOARDING_STORAGE_KEY = 'onboarding_data'

/**
 * Save onboarding data to localStorage
 */
export function saveOnboardingData(data: Partial<OnboardingData>): void {
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

  // Company is required for students
  if (data.role === 'student' && !data.company_id) {
    missingFields.push('company_id')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}