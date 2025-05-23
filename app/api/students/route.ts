import { promises as fs } from "fs"
import path from "path"
import { NextResponse } from "next/server"
import type { Student } from "@/lib/data"

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

// GET /api/students - Get all students
export async function GET() {
  try {
    const students = await readStudentsFile()
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// GET /api/students/[id] - Get student by ID
export async function GET_BY_ID(request: Request, { params }: { params: { id: string } }) {
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

// POST /api/students - Add new student
export async function POST(request: Request) {
  try {
    const newStudent = await request.json()
    const students = await readStudentsFile()
    
    // Add the new student
    students.push(newStudent)
    
    // Write back to file
    const filePath = path.join(process.cwd(), "data", "students.json")
    await fs.writeFile(filePath, JSON.stringify(students, null, 2))
    
    return NextResponse.json(newStudent)
  } catch (error) {
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 })
  }
} 