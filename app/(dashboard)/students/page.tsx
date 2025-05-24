"use client"

import { useState, useEffect } from "react"
import { getAllStudents, type Student, companies } from "@/lib/data"
import { AddStudentModal } from "@/components/add-student-modal"
import { EditScoreModal } from "@/components/edit-score-modal"
import { DeleteStudentDialog } from "@/components/delete-student-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Plus, Trophy, Trash2 } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Helper function to split full name into first and last name
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(" ")
  const lastName = parts.pop() || ""
  const firstName = parts.join(" ")
  return { firstName, lastName }
}

// Helper function to check if user is a student leader
const isStudentLeader = (role: string) => {
  return role === "President" || role === "Officer"
}

// Helper function to check if user is a normal student
const hasNormalStudentRole = (role: string): boolean => {
  return role === "Member"
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("Alpha Company")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)
  const [userData, setUserData] = useState<{ type: string; user: Student | any } | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserData = localStorage.getItem("userData")
    
    if (storedUserType && storedUserData) {
      try {
        const userType = storedUserType
        const user = JSON.parse(storedUserData)
        setUserData({ type: userType, user })

        // If user is a student leader, set their company as selected
        if (userType === "student" && isStudentLeader(user.companyRole)) {
          setSelectedCompany(user.company)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allStudents = await getAllStudents()
        setStudents(allStudents)
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Filter students based on user role
  const filteredStudents = students.filter(student => {
    if (userData?.type === "admin") return student.company === selectedCompany
    if (userData?.type === "student") {
      if (isStudentLeader(userData.user.companyRole)) {
        return student.company === userData.user.company
      }
      // Normal students can only see students from their own company
      return student.company === userData.user.company
    }
    return student.company === selectedCompany
  })

  const isLeader = userData?.type === "student" && isStudentLeader(userData.user.companyRole)
  const isNormalStudent = userData?.type === "student" && hasNormalStudentRole(userData.user.companyRole)
  const canEditStudents = userData?.type === "admin" || isLeader

  const generateStudentId = () => {
    const lastStudent = students[students.length - 1]
    const lastId = lastStudent ? parseInt(lastStudent.studentId.replace("ACU", "")) : 20123
    const newId = lastId + 1
    return `ACU${newId.toString().padStart(5, "0")}`
  }

  const handleAddStudent = async (data: any) => {
    try {
      const newStudent: Student = {
        id: (students.length + 1).toString(),
        studentId: generateStudentId(),
        name: data.name,
        email: data.email,
        phoneNumber: `(${data.phoneNumber.slice(0, 3)}) ${data.phoneNumber.slice(3, 6)}-${data.phoneNumber.slice(6)}`,
        year: data.year,
        company: isLeader ? userData.user.company : data.company,
        companyRole: data.companyRole,
        score: {
          lionGames: 80,
          attendance: 85,
          leadershipRoles: 75,
          serviceHours: 80,
          apartmentChecks: 85,
          eventExecution: 80,
          grades: 3.5
        },
        scoreChangeHistory: []
      }

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      })

      if (!response.ok) {
        throw new Error("Failed to add student")
      }

      // Update local state
      setStudents([...students, newStudent])
    } catch (error) {
      console.error("Error adding student:", error)
      throw error
    }
  }

  const handleEditScore = async (data: any) => {
    if (!editingStudent) return

    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update score")
      }

      const updatedStudent = await response.json()
      setStudents(students.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      ))
    } catch (error) {
      console.error("Error updating score:", error)
      throw error
    }
  }

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return

    try {
      const response = await fetch(`/api/students/${deletingStudent.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete student")
      }

      // Update local state
      setStudents(students.filter(student => student.id !== deletingStudent.id))
    } catch (error) {
      console.error("Error deleting student:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-[100vw] h-[100vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[100vw] mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden shadow-lg max-w-[90vw] md:max-w-[70vw]">
        <CardHeader className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-4">
          <CardTitle>Student Directory</CardTitle>
          <div className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:gap-4 md:space-y-0">
            {isNormalStudent ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Viewing:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {userData.user.company}
                </Badge>
              </div>
            ) : isLeader ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Viewing:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {userData.user.company}
                </Badge>
              </div>
            ) : (
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {canEditStudents && (
              <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead className={"w-[150px]"}>First Name</TableHead>
                  <TableHead className={"w-[150px]"}>Last Name</TableHead>
                  <TableHead className={"w-[250px]"}>Email</TableHead>
                  <TableHead className={"w-[150px]"}>Phone</TableHead>
                  <TableHead className={"w-[100px]"}>Year</TableHead>
                  <TableHead className={"w-[150px]"}>Company Role</TableHead>
                  {canEditStudents && (
                    <TableHead className={"w-[100px] border-l text-center"}>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const { firstName, lastName } = splitName(student.name)
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{firstName}</TableCell>
                      <TableCell className="font-medium">{lastName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phoneNumber}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{student.companyRole}</TableCell>
                      {canEditStudents && (
                        <TableCell className="border-l">
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingStudent(student)}
                                  >
                                    <Trophy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit Score</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingStudent(student)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 dark:text-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Student</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canEditStudents ? 7 : 6} className="text-center text-muted-foreground border-l">
                      No students found in {userData?.user.company || selectedCompany}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {canEditStudents && (
        <>
          <AddStudentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddStudent}
            isLeader={isLeader}
            leaderCompany={isLeader ? userData.user.company : undefined}
          />

          {editingStudent && (
            <EditScoreModal
              isOpen={!!editingStudent}
              onClose={() => setEditingStudent(null)}
              student={editingStudent}
              onSubmit={handleEditScore}
            />
          )}

          {deletingStudent && (
            <DeleteStudentDialog
              isOpen={!!deletingStudent}
              onClose={() => setDeletingStudent(null)}
              student={deletingStudent}
              onConfirm={handleDeleteStudent}
            />
          )}
        </>
      )}
      </div>
    </motion.div>
  )
}
