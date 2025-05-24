import { promises as fs } from "fs"
import path from "path"

// Types for our data model
export interface Student {
  id: string
  studentId: string
  name: string
  email: string
  phoneNumber: string
  year: string
  company: string
  companyRole: string
  password?: string
  bio?: string
  dateOfBirth?: string
  avatarUrl?: string
  score: {
    lionGames: number
    attendance: number
    leadershipRoles: number
    serviceHours: number
    apartmentChecks: number
    eventExecution: number
    grades: number
  }
  scoreChangeHistory: Array<{
    date: string
    category: ScoreCategory
    oldScore: number
    newScore: number
    reason: string
  }>
}

export interface Admin {
  id: string
  name: string
  email: string
  password: string
  phoneNumber: string
  role: "admin"
  bio: string
  company: "admin"
  companyRole: "admin"
  avatarUrl?: string
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

// Helper function to generate password from name
export function generatePasswordFromName(name: string): string {
  const [firstName, lastName] = name.toLowerCase().split(" ")
  return `${firstName}${lastName}`
}

// Helper function to validate credentials
export async function validateCredentials(email: string, password: string): Promise<{ type: "student" | "admin", user: Student | Admin } | null> {
  try {
    console.log("Validating credentials for:", email)

    // Check students
    const studentsResponse = await fetch("/api/students")
    if (studentsResponse.ok) {
      const students: Student[] = await studentsResponse.json()
      const student = students.find(s => s.email === email && s.password === password)
      if (student) {
        console.log("Found matching student account")
        return { type: "student", user: student }
      }
    }

    // Check admins
    console.log("Checking admin credentials...")
    const adminsResponse = await fetch("/api/admins")
    if (adminsResponse.ok) {
      const admins: Admin[] = await adminsResponse.json()
      console.log("Found admins:", admins.map(a => ({ email: a.email, password: a.password })))
      const admin = admins.find(a => a.email === email && a.password === password)
      if (admin) {
        console.log("Found matching admin account")
        return { type: "admin", user: admin }
      }
    } else {
      console.error("Failed to fetch admins:", adminsResponse.status, adminsResponse.statusText)
    }

    console.log("No matching credentials found")
    return null
  } catch (error) {
    console.error("Error validating credentials:", error)
    return null
  }
}
