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

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
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

// Extract a friendly term label from Populi academic term display_name
// e.g. "2024-2025: Spring 2025" -> "Spring 2025"
export function extractTermShortName(displayName?: string | null): string | null {
  if (!displayName) return null
  const parts = String(displayName).split(':')
  const tail = (parts.length > 1 ? parts[1] : parts[0]) ?? ''
  const trimmed = String(tail).trim()
  return trimmed.length > 0 ? trimmed : null
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
 * Check if an event is eligible for monthly check-in submission
 * Uses the same logic as attendance events - eligible if past due or within the next hour
 */
export function isEventEligibleForMonthlyCheckin(eventDueDate: string): boolean {
  // Monthly check-ins use the same timing logic as attendance
  return isEventEligibleForAttendance(eventDueDate)
}

/**
 * Check if an event is eligible for participation submission
 * Participation events are only available after the event is over (past due)
 */
export function isEventEligibleForParticipation(eventDueDate: string): boolean {
  const now = new Date()
  const eventDate = new Date(eventDueDate)
  
  // Participation events are only eligible after the event is over
  return eventDate <= now
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

// Grade conversion utilities
/**
 * Convert percentage grade to letter grade
 */
export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+'
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 63) return 'D'
  if (percentage >= 60) return 'D-'
  return 'F'
}

/**
 * Convert percentage grade to GPA points (4.0 scale)
 */
export function percentageToGPA(percentage: number): number {
  if (percentage >= 97) return 4.0
  if (percentage >= 93) return 4.0
  if (percentage >= 90) return 3.7
  if (percentage >= 87) return 3.3
  if (percentage >= 83) return 3.0
  if (percentage >= 80) return 2.7
  if (percentage >= 77) return 2.3
  if (percentage >= 73) return 2.0
  if (percentage >= 70) return 1.7
  if (percentage >= 67) return 1.3
  if (percentage >= 63) return 1.0
  if (percentage >= 60) return 0.7
  return 0.0
}

/**
 * Convert letter grade to GPA points (4.0 scale)
 */
export function letterGradeToGPA(grade: string): number {
  const gradeMap: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  }
  return gradeMap[grade.toUpperCase()] || 0.0
}

/**
 * Format grade string - converts percentage strings to letter grades, preserves letter grades
 */
export function formatGradeDisplay(gradeString: string): string {
  // If it's already a letter grade, return as is
  if (/^[A-F][+-]?$/i.test(gradeString.trim())) {
    return gradeString.toUpperCase()
  }
  
  // Handle special cases for non-graded courses
  if (gradeString.toLowerCase().includes('in progress') || 
      gradeString.toLowerCase().includes('n/a') ||
      gradeString.toLowerCase() === 'pending') {
    return gradeString
  }
  
  // If it contains a percentage symbol, extract the number and convert
  if (gradeString.includes('%')) {
    const percentage = parseFloat(gradeString.replace('%', ''))
    if (!isNaN(percentage)) {
      return percentageToLetterGrade(percentage)
    }
  }
  
  // Try to parse as a raw number (percentage)
  const numericGrade = parseFloat(gradeString)
  if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
    return percentageToLetterGrade(numericGrade)
  }
  
  // If none of the above work, return the original string
  return gradeString
}

/**
 * Convert any grade format to GPA points
 */
export function gradeToGPA(gradeString: string): number {
  // If it's already a letter grade, convert directly
  if (/^[A-F][+-]?$/i.test(gradeString.trim())) {
    return letterGradeToGPA(gradeString)
  }
  
  // If it contains a percentage symbol, extract the number and convert
  if (gradeString.includes('%')) {
    const percentage = parseFloat(gradeString.replace('%', ''))
    if (!isNaN(percentage)) {
      return percentageToGPA(percentage)
    }
  }
  
  // Try to parse as a raw number (percentage)
  const numericGrade = parseFloat(gradeString)
  if (!isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100) {
    return percentageToGPA(numericGrade)
  }
  
  // Default to 0 if we can't parse
  return 0.0
}

/**
 * Extract a clean event type name from event submission data
 */
export function getActivityNameFromSubmission(submissionData: Record<string, unknown>, eventName?: string): string {
  const submissionType = submissionData.submission_type as string
  
  switch (submissionType) {
    case 'attendance':
      // Try to extract meaningful name from notes or use event name
      const notes = submissionData.notes as string
      if (notes) {
        // Extract event type from notes like "chapel_attendance attendance #2"
        if (notes.includes('chapel')) return 'Chapel'
        if (notes.includes('fellow_friday')) return 'Fellow Friday'
        if (notes.includes('gbe')) return 'GBE'
        if (notes.includes('company_community')) return 'Company Event'
      }
      // Use event name if available and not a seed name
      if (eventName && !eventName.includes('SEED')) {
        return eventName
      }
      return 'Attendance'
    
    case 'community_service':
      return 'Community Service'
    
    case 'job_promotion':
      return 'Job Promotion'
    
    case 'credentials':
      return 'Credential'
    
    case 'team_participation':
      const teamType = submissionData.team_type as string
      return teamType === 'fellow_friday_team' ? 'Fellow Friday' : 
             teamType === 'chapel_team' ? 'Chapel Team' : 'Team Participation'
    
    case 'small_group':
      return 'Small Group'
    
    case 'dream_team':
      return 'Dream Team'
    
    case 'gbe_participation':
      return 'GBE Participation'
    
    case 'company_team_building':
      return 'Company Team Building'
    
    case 'lions_games':
      return 'Lions Games'
    
    case 'participation':
      return 'Participation Event'
    
    default:
      return submissionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

/**
 * Extract status from event submission data (for non-point events)
 */
export function getStatusFromSubmission(submissionData: Record<string, unknown>): string | null {
  const submissionType = submissionData.submission_type as string
  
  switch (submissionType) {
    case 'attendance':
      const status = submissionData.status as string
      return status === 'present' ? 'Present' : 
             status === 'absent' ? 'Absent' : 
             status === 'excused' ? 'Excused' : null
    
    case 'small_group':
    case 'dream_team':
      const monthlyStatus = submissionData.status as string
      return monthlyStatus === 'involved' ? 'Involved' : 'Not Involved'
    
    // For point-based events, return null (they should show points instead)
    case 'community_service':
    case 'job_promotion':
    case 'credentials':
    case 'team_participation':
    case 'gbe_participation':
    case 'company_team_building':
    case 'lions_games':
    case 'participation':
      return null
    
    default:
      return null
  }
}

/**
 * Check if an event submission should display points (vs status)
 */
export function shouldShowPoints(submissionData: Record<string, unknown>): boolean {
  const submissionType = submissionData.submission_type as string
  
  switch (submissionType) {
    case 'attendance':
    case 'small_group':
    case 'dream_team':
      return false // These show status instead
    
    case 'community_service':
    case 'job_promotion':
    case 'credentials':
    case 'team_participation':
    case 'gbe_participation':
    case 'company_team_building':
    case 'lions_games':
    case 'participation':
      return true // These show points
    
    default:
      return false
  }
}

/**
 * Extract points earned from event submission data
 */
export function getPointsFromSubmission(
  submissionData: Record<string, unknown>, 
  pointsGranted?: number | null
): number | undefined {
  // First check if points were granted by staff
  if (pointsGranted !== null && pointsGranted !== undefined) {
    return Number(pointsGranted)
  }
  
  const submissionType = submissionData.submission_type as string
  
  switch (submissionType) {
    case 'attendance':
      const status = submissionData.status as string
      return status === 'present' ? 1 : 0
    
    case 'community_service':
      const hours = submissionData.hours as number
      return hours // Points typically equal hours for community service
    
    case 'job_promotion':
    case 'credentials':
      // These are staff-assigned, so return assigned_points if available
      const assignedPoints = submissionData.assigned_points as number
      return assignedPoints || undefined
    
    case 'small_group':
    case 'dream_team':
      const monthlyStatus = submissionData.status as string
      return monthlyStatus === 'involved' ? 1 : 0
    
    case 'gbe_participation':
    case 'company_team_building':
    case 'participation':
      return submissionData.points as number
    
    case 'team_participation':
      return 1 // Standard point for team participation
    
    case 'lions_games':
      const lionsPoints = submissionData.assigned_points as number
      return lionsPoints || undefined
    
    default:
      return undefined
  }
} 