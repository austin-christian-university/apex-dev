import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Student } from "@/lib/data"

const dataFilePath = path.join(process.cwd(), "data", "students.json")

async function readStudents(): Promise<Student[]> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading students file:", error)
    return []
  }
}

async function writeStudents(students: Student[]): Promise<void> {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(students, null, 2))
  } catch (error) {
    console.error("Error writing students file:", error)
    throw new Error("Failed to update students data")
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const students = await readStudents()
    const student = students.find((s) => s.id === params.id)

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(student.scoreChangeHistory)
  } catch (error) {
    console.error("Error fetching score history:", error)
    return NextResponse.json(
      { error: "Failed to fetch score history" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { historyId, changes } = await request.json()
    const students = await readStudents()
    const studentIndex = students.findIndex((s) => s.id === params.id)

    if (studentIndex === -1) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    const historyIndex = students[studentIndex].scoreChangeHistory.findIndex(
      (entry) => entry.id === historyId
    )

    if (historyIndex === -1) {
      return NextResponse.json(
        { error: "History entry not found" },
        { status: 404 }
      )
    }

    // Update the history entry
    students[studentIndex].scoreChangeHistory[historyIndex] = {
      ...students[studentIndex].scoreChangeHistory[historyIndex],
      ...changes,
    }

    await writeStudents(students)
    return NextResponse.json(students[studentIndex].scoreChangeHistory[historyIndex])
  } catch (error) {
    console.error("Error updating score history:", error)
    return NextResponse.json(
      { error: "Failed to update score history" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { historyId } = await request.json()
    const students = await readStudents()
    const studentIndex = students.findIndex((s) => s.id === params.id)

    if (studentIndex === -1) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    // Remove the history entry
    students[studentIndex].scoreChangeHistory = students[studentIndex].scoreChangeHistory.filter(
      (entry) => entry.id !== historyId
    )

    await writeStudents(students)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting score history:", error)
    return NextResponse.json(
      { error: "Failed to delete score history" },
      { status: 500 }
    )
  }
} 