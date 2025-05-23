"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { StudentSelector } from "@/components/student-selector"
import { FourPillarsChart } from "@/components/four-pillars-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getStudentById, type Student } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Mail, Calendar, BookOpen, Award, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentProfilePage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1")
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userRole = useUserRole()

  // Get avatar image based on student name
  const getStudentAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  }

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true)
        const fetchedStudent = await getStudentById(selectedStudentId)
        if (fetchedStudent) {
          setStudent(fetchedStudent)
        }
      } catch (error) {
        console.error("Error fetching student:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [selectedStudentId])

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
          <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
          <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Comprehensive student information and records</p>
        </div>
        <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <Card className="shadow-card border border-border/60 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center">
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-background">
                    <Image
                      src={getStudentAvatar(student.name)}
                      alt={student.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-muted-foreground">{student.email}</p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30">
                    {student.year}
                  </Badge>
                </div>

                <div className="space-y-4 border-t border-border pt-4 w-full">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Student ID</p>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Company Role</p>
                      <p className="text-sm text-muted-foreground">{student.companyRole}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card className="shadow-card border border-border/60">
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">GPA</span>
                    <span className="font-medium">{student.score.grades.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <span className="font-medium">{student.score.attendance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Service Hours</span>
                    <span className="font-medium">{student.score.serviceHours}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Leadership</span>
                    <span className="font-medium">{student.score.leadershipRoles}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-card border border-border/60">
            <CardHeader>
              <CardTitle>Score History</CardTitle>
              <CardDescription>Recent changes in student performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.scoreChangeHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent changes</p>
                ) : (
                  student.scoreChangeHistory.map((change, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/60">
                      <div className="flex-1">
                        <p className="font-medium">{change.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(change.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          change.pointChange > 0
                            ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                            : "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
                        }
                      >
                        {change.pointChange > 0 ? "+" : ""}
                        {change.pointChange} points
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
