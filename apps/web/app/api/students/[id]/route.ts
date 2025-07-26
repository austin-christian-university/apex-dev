import { promises as fs } from "fs"
import { existsSync } from "fs"
import path from "path"
import { NextResponse } from "next/server"
import type { Student } from "@/lib/data"
import { v4 as uuidv4 } from 'uuid'
import { unlink } from 'fs/promises'

type ScoreCategory = keyof Student["score"]

interface ScoreUpdate {
  category: ScoreCategory
  pointChange: number
  description: string
  date?: string
}

interface ProfileUpdate {
  name?: string
  phoneNumber?: string
  dateOfBirth?: string
  bio?: string
  avatarUrl?: string
}

// Helper function to read students file
async function readStudentsFile(): Promise<Student[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "students.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    return JSON.parse(fileContents)
  } catch (error) {
    console.error("Error reading students file:", error)
    return []
  }
}

// Helper function to write students file
async function writeStudentsFile(students: Student[]): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), "data", "students.json")
    await fs.writeFile(filePath, JSON.stringify(students, null, 2))
  } catch (error) {
    console.error("Error writing students file:", error)
    throw error
  }
}

// Helper function to delete avatar file
async function deleteAvatarFile(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return

  try {
    const filePath = path.join(process.cwd(), 'public', avatarUrl)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  } catch (error) {
    console.error('Error deleting avatar file:', error)
  }
}

// GET /api/students/[id] - Get student by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const students = await readStudentsFile()
    const student = students.find((s) => s.id === params.id)
    
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const students = await readStudentsFile()
    const studentIndex = students.findIndex((s) => s.id === params.id)
    
    if (studentIndex === -1) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    // Remove the student
    students.splice(studentIndex, 1)
    
    // Write back to file
    await writeStudentsFile(students)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}

// PATCH /api/students/[id] - Update student profile or score
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const students = await readStudentsFile()
    const studentIndex = students.findIndex((s) => s.id === params.id)
    
    if (studentIndex === -1) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    const student = students[studentIndex]
    const updateData = await request.json()

    // Check if this is a score update
    if ('category' in updateData && 'pointChange' in updateData) {
      const { category, pointChange, description, date } = updateData as ScoreUpdate
      
      // Update the score for the category
      student.score[category] = Math.max(0, Math.min(100, student.score[category] + pointChange))
      
      // Add to score change history with a unique ID
      student.scoreChangeHistory.unshift({
        id: uuidv4(),
        category,
        pointChange,
        description,
        date: date || new Date().toISOString().split('T')[0]
      })
    } 
    // Otherwise, treat as a profile update
    else {
      const { name, phoneNumber, dateOfBirth, bio, avatarUrl } = updateData as ProfileUpdate
      
      // If avatarUrl is being updated to null, delete the old avatar file
      if (avatarUrl === null && student.avatarUrl) {
        await deleteAvatarFile(student.avatarUrl)
      }
      
      // Update only the fields that were provided
      if (name !== undefined) student.name = name
      if (phoneNumber !== undefined) student.phoneNumber = phoneNumber
      if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth
      if (bio !== undefined) student.bio = bio
      if (avatarUrl !== undefined) student.avatarUrl = avatarUrl
    }
    
    // Write back to file
    await writeStudentsFile(students)
    
    return NextResponse.json(student)
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      { error: "Failed to update student", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 