"use client"

import { useState, useEffect } from "react"
import { getAllStudents, type Student, companies } from "@/lib/data"
import { AddStudentModal } from "@/components/add-student-modal"
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
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("Alpha Company")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

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

  const filteredStudents = students.filter(student => student.company === selectedCompany)

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
        company: data.company,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
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
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Student Directory</CardTitle>
          <div className="flex items-center gap-4">
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
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={"w-[200px]"}>Name</TableHead>
                  <TableHead className={"w-[250px]"}>Email</TableHead>
                  <TableHead className={"w-[150px]"}>Phone</TableHead>
                  <TableHead className={"w-[100px]"}>Year</TableHead>
                  <TableHead className={"w-[150px]"}>Company Role</TableHead>
                  <TableHead className={"w-[120px]"}>Student ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phoneNumber}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>{student.companyRole}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                  </TableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No students found in {selectedCompany}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />
    </motion.div>
  )
}
