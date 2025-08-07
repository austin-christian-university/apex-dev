import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
  }
  
  // Return original if not 10 digits
  return value
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Score calculation utilities
export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function calculateTotalScore(scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0)
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidScore(score: number): boolean {
  return score >= 0 && score <= 100
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// UUID generation (if not using a library)
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// Event utility functions
export function isEventApplicableToUser(
  event: { required_roles: string[] | null; required_company: string | null },
  userRole: string,
  userCompanyId?: string
): boolean {
  // Check if user's role is in required roles (or if no roles specified, allow all)
  if (event.required_roles && event.required_roles.length > 0) {
    if (!event.required_roles.includes(userRole)) {
      return false
    }
  }

  // Check if event is company-specific and user's company matches
  if (event.required_company) {
    return userCompanyId === event.required_company
  }

  // If no company specified, event applies to all companies
  return true
}

export function categorizeEventByDueDate(event: { due_date: string | null }): {
  isUrgent: boolean
  isPastDue: boolean
  daysUntilDue: number
  formattedDueDate: string
} {
  if (!event.due_date) {
    return {
      isUrgent: false,
      isPastDue: false,
      daysUntilDue: 0,
      formattedDueDate: 'No due date'
    }
  }

  const now = new Date()
  const dueDate = new Date(event.due_date)
  const diffTime = dueDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const isPastDue = diffDays < 0
  const isUrgent = diffDays <= 1 && diffDays >= 0 // Due today or tomorrow

  // Format due date for display
  let formattedDueDate: string
  if (diffDays < 0) {
    formattedDueDate = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`
  } else if (diffDays === 0) {
    formattedDueDate = 'Due today'
  } else if (diffDays === 1) {
    formattedDueDate = 'Due tomorrow'
  } else if (diffDays <= 7) {
    formattedDueDate = `Due in ${diffDays} days`
  } else {
    formattedDueDate = dueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    isUrgent,
    isPastDue,
    daysUntilDue: diffDays,
    formattedDueDate
  }
}

export function filterAndSortEvents(
  events: Array<{ due_date: string | null; required_roles: string[] | null; required_company: string | null }>,
  userRole: string,
  userCompanyId?: string,
  includePastDue: boolean = true
): typeof events {
  return events
    .filter(event => isEventApplicableToUser(event, userRole, userCompanyId))
    .filter(event => {
      if (!event.due_date) return false
      const { isPastDue } = categorizeEventByDueDate(event)
      return includePastDue ? true : !isPastDue
    })
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
}

/**
 * Check if an event is eligible for attendance submission
 * Events are eligible if they are past due or start within the next hour
 */
export function isEventEligibleForAttendance(eventDueDate: string): boolean {
  const now = new Date()
  const eventDate = new Date(eventDueDate)
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour in milliseconds
  
  // Event is eligible if it's past or starts within the next hour
  return eventDate <= oneHourFromNow
}

/**
 * Calculate company ranking based on holistic GPA
 * This is a placeholder - will be implemented when scoring system is built
 */
export function calculateCompanyRank(companies: Array<{ id: string; holisticGPA: number }>): Map<string, number> {
  const sorted = companies
    .sort((a, b) => b.holisticGPA - a.holisticGPA)
  
  const rankMap = new Map<string, number>()
  sorted.forEach((company, index) => {
    rankMap.set(company.id, index + 1)
  })
  
  return rankMap
}

/**
 * Format company motto with proper capitalization
 */
export function formatCompanyMotto(motto: string | null): string {
  if (!motto || motto.trim() === '') return ''
  
  return motto
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Validate file type for photos
 */
export function isValidPhotoFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate file size (max 5MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Compress image if needed (basic compression)
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      
      // Draw compressed image
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Process multiple photo files for submission
 */
export async function processPhotosForSubmission(files: File[]): Promise<{
  photos: string[]
  errors: string[]
}> {
  const photos: string[] = []
  const errors: string[] = []
  
  for (const file of files) {
    try {
      // Validate file type
      if (!isValidPhotoFile(file)) {
        errors.push(`${file.name}: Invalid file type. Please use JPG, PNG, or WebP.`)
        continue
      }
      
      // Validate file size
      if (!isValidFileSize(file)) {
        errors.push(`${file.name}: File too large. Maximum size is 5MB.`)
        continue
      }
      
      // Compress if needed
      let processedFile = file
      if (file.size > 1024 * 1024) { // If larger than 1MB, compress
        try {
          processedFile = await compressImage(file)
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError)
        }
      }
      
      // Convert to base64
      const base64 = await fileToBase64(processedFile)
      photos.push(base64)
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return { photos, errors }
} 