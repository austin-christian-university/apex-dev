"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getAllStudents, type Student } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentSelectorProps {
  selectedStudentId: string
  onStudentChange: (studentId: string) => void
}

export function StudentSelector({ selectedStudentId, onStudentChange }: StudentSelectorProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const userRole = useUserRole()

  // Load students
  useEffect(() => {
    const allStudents = getAllStudents()
    setStudents(allStudents)

    // Set the selected student
    const student = allStudents.find((s) => s.id === selectedStudentId)
    if (student) {
      setSelectedStudent(student)
    } else if (allStudents.length > 0) {
      setSelectedStudent(allStudents[0])
      onStudentChange(allStudents[0].id)
    }
  }, [selectedStudentId, onStudentChange])

  // If user is a student, they can only see their own profile
  useEffect(() => {
    if (userRole === "student") {
      // In a real app, we would get the current user's ID from auth context
      // For now, we'll use a mock student ID from environment or config
      const mockStudentId = process.env.NEXT_PUBLIC_MOCK_STUDENT_ID || "1"
      const student = students.find((s) => s.id === mockStudentId)
      if (student) {
        setSelectedStudent(student)
        onStudentChange(student.id)
      }
    }
  }, [userRole, students, onStudentChange])

  // Replace getStudentAvatar to use DiceBear
  function getStudentAvatar(id: string, name?: string) {
    // Use initials if name is provided, otherwise use id
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
        <span className="font-medium text-foreground">{selectedStudent?.name || "Loading..."}</span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {selectedStudent ? (
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
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder="Search students..." />
          </div>
          <CommandList>
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.id}
                  onSelect={() => {
                    setSelectedStudent(student)
                    onStudentChange(student.id)
                    setOpen(false)
                  }}
                >
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
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
