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