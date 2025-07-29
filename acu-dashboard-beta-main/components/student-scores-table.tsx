"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Student } from "@/lib/data"

interface StudentScoresTableProps {
  students: Student[]
  selectedCompany: string
  onCompanyChange: (company: string) => void
  isLeader?: boolean
  isNormalStudent?: boolean
}

export function StudentScoresTable({ 
  students, 
  selectedCompany, 
  onCompanyChange,
  isLeader = false,
  isNormalStudent = false
}: StudentScoresTableProps) {
  const companyStudents = students.filter(student => student.company === selectedCompany)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Scores</CardTitle>
          {isNormalStudent ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your Scores</span>
            </div>
          ) : isLeader ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Viewing:</span>
              <Badge variant="secondary" className="text-sm px-2 py-1">
                {selectedCompany}
              </Badge>
            </div>
          ) : (
            <Select value={selectedCompany} onValueChange={onCompanyChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alpha Company">Alpha Company</SelectItem>
                <SelectItem value="Bravo Company">Bravo Company</SelectItem>
                <SelectItem value="Charlie Company">Charlie Company</SelectItem>
                <SelectItem value="Delta Company">Delta Company</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="min-w-[800px] p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Name</th>
                    <th className="p-2 text-left font-medium">Lion Games</th>
                    <th className="p-2 text-left font-medium">Attendance</th>
                    <th className="p-2 text-left font-medium">Leadership</th>
                    <th className="p-2 text-left font-medium">Service</th>
                    <th className="p-2 text-left font-medium">Apartment</th>
                    <th className="p-2 text-left font-medium">Events</th>
                    <th className="p-2 text-left font-medium">Grades</th>
                    <th className="p-2 text-left font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {companyStudents.map((student) => {
                    const totalScore = Object.values(student.score).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)
                    return (
                      <tr key={student.id} className="border-b">
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="p-2">{student.score.lionGames}</td>
                        <td className="p-2">{student.score.attendance}</td>
                        <td className="p-2">{student.score.leadershipRoles}</td>
                        <td className="p-2">{student.score.serviceHours}</td>
                        <td className="p-2">{student.score.apartmentChecks}</td>
                        <td className="p-2">{student.score.eventExecution}</td>
                        <td className="p-2">{student.score.grades}</td>
                        <td className="p-2 font-bold">{totalScore}</td>
                      </tr>
                    )
                  })}
                  {companyStudents.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-muted-foreground">
                        No students found in {selectedCompany}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
} 