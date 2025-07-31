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