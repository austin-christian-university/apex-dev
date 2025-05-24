"use client"

import { useState, useEffect } from "react"
import { getAllStudents, type Student } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentSelectorProps {
  selectedStudentId: string
  onStudentChange: (studentId: string) => void
}

export function StudentSelector({ selectedStudentId, onStudentChange }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRole = useUserRole()

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true)
        const allStudents = await getAllStudents()
        setStudents(allStudents)

        // Set the selected student
        const student = allStudents.find((s) => s.id === selectedStudentId)
        if (student) {
          setSelectedStudent(student)
        } else if (allStudents.length > 0) {
          setSelectedStudent(allStudents[0])
          onStudentChange(allStudents[0].id)
        }
      } catch (error) {
        console.error("Error loading students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [selectedStudentId, onStudentChange])

  // If user is a student, they can only see their own profile
  useEffect(() => {
    if (userRole === "student" && students.length > 0) {
      const mockStudentId = process.env.NEXT_PUBLIC_MOCK_STUDENT_ID || "1"
      const student = students.find((s) => s.id === mockStudentId)
      if (student) {
        setSelectedStudent(student)
        onStudentChange(student.id)
      }
    }
  }, [userRole, students, onStudentChange])

  function getStudentAvatar(id: string, name?: string) {
    const seed = name ? encodeURIComponent(name) : id
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`
  }

  // If user is a student, show a simplified view
  if (userRole === "student") {
    return (
      <div className="flex items-center space-x-2 bg-secondary/50 dark:bg-secondary/20 px-3 py-2 rounded-md border border-border/60">
        <Avatar className="h-8 w-8 border border-primary/10">
          <AvatarImage
            src={selectedStudent ? getStudentAvatar(selectedStudent.id, selectedStudent.name) : "https://api.dicebear.com/7.x/initials/svg?seed=Student"}
            alt={selectedStudent?.name || "Student"}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {selectedStudent?.name?.charAt(0) || "S"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">
          {isLoading ? "Loading..." : selectedStudent?.name || "Student not found"}
        </span>
      </div>
    )
  }

  return (
    <Select
      value={selectedStudentId}
      onValueChange={(value) => {
        const student = students.find((s) => s.id === value)
        if (student) {
          setSelectedStudent(student)
          onStudentChange(value)
        }
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[300px]">
        {isLoading ? (
          "Loading students..."
        ) : selectedStudent ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 border border-primary/10">
              <AvatarImage
                src={getStudentAvatar(selectedStudent.id, selectedStudent.name)}
                alt={selectedStudent.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {selectedStudent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{selectedStudent.name}</span>
          </div>
        ) : (
          "Select student..."
        )}
      </SelectTrigger>
      <SelectContent>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 border border-primary/10">
                <AvatarImage
                  src={getStudentAvatar(student.id, student.name)}
                  alt={student.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{student.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
