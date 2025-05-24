import { promises as fs } from "fs"
import path from "path"

// Types for our data model
export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  phoneNumber: string
  year: "Freshman" | "Sophomore" | "Junior" | "Senior"
  company: string
  companyRole: "President" | "Officer" | "Member"
  bio: string
  dateOfBirth: string // Format: YYYY-MM-DD
  avatarUrl?: string // Optional path to custom avatar image
  score: {
    lionGames: number
    attendance: number
    leadershipRoles: number
    serviceHours: number
    apartmentChecks: number
    eventExecution: number
    grades: number
  }
  scoreChangeHistory: ScoreChangeHistoryEntry[]
}

export type ScoreCategory = "lionGames" | "attendance" | "leadershipRoles" | "serviceHours" | "apartmentChecks" | "eventExecution" | "grades"

export type ScoreChangeHistoryEntry = {
  id: string
  category: ScoreCategory
  description: string
  pointChange: number
  date: string
}

// User types with avatars
export const userTypes = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all features and data",
    avatar: "/placeholder.svg?height=40&width=40&text=A",
    permissions: ["view", "edit", "delete", "manage_users"],
  },
  {
    id: "leader",
    name: "Student Leader",
    description: "Can view and edit student data",
    avatar: "/placeholder.svg?height=40&width=40&text=L",
    permissions: ["view", "edit"],
  },
  {
    id: "student",
    name: "Student",
    description: "Can view own data only",
    avatar: "/placeholder.svg?height=40&width=40&text=S",
    permissions: ["view_own"],
  },
]

// Company names
export const companies = [
  "Alpha Company",
  "Bravo Company",
  "Charlie Company",
  "Delta Company"
] as const

// Helper functions
export async function getStudentById(id: string): Promise<Student | null> {
  try {
    const response = await fetch(`/api/students/${id}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch student")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching student:", error)
    return null
  }
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    const response = await fetch("/api/students")
    if (!response.ok) {
      throw new Error("Failed to fetch students")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching students:", error)
    return []
  }
}

export async function getStudentsByCompany(company: string): Promise<Student[]> {
  try {
    const students = await getAllStudents()
    return students.filter((student) => student.company === company)
  } catch (error) {
    console.error("Error fetching students by company:", error)
    return []
  }
}

export function getUserTypeById(id: string) {
  return userTypes.find((type) => type.id === id) || null
}

// Mock function for user role
export function useUserRole() {
  // In a real app, this would come from an auth context
  return "admin"
}
