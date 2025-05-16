"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { StudentSelector } from "@/components/student-selector"
import { FourPillarsChart } from "@/components/four-pillars-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getStudentById, type Student, type Achievement } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Mail, Calendar, BookOpen, Award, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentProfilePage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1")
  const [student, setStudent] = useState<Student | null>(null)
  const userRole = useUserRole()

  // Get avatar image based on student name
  const getStudentAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  }

  useEffect(() => {
    const fetchedStudent = getStudentById(selectedStudentId)
    if (fetchedStudent) {
      setStudent(fetchedStudent)
    }
  }, [selectedStudentId])

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">Student Profile</h1>
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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
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
                  <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-muted-foreground">{student.email}</p>
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30">
                    {student.year}
                    {getOrdinal(student.year)} Year Student
                  </Badge>
                </div>

                <div className="space-y-4 border-t border-border pt-4 w-full">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Major</p>
                      <p className="text-sm text-muted-foreground">{student.major}</p>
                    </div>
                  </div>

                  {student.minor && (
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Minor</p>
                        <p className="text-sm text-muted-foreground">{student.minor}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">GPA</p>
                      <p className="text-sm text-muted-foreground">{student.gpa.toFixed(2)}</p>
                    </div>
                  </div>

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
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <FourPillarsChart data={student.pillars} size="sm" />
          </div>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="academic" className="animate-fade-in">
            <TabsList className="mb-6 bg-background border border-border/60 p-1 shadow-sm">
              <TabsTrigger
                value="academic"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-none"
              >
                Academic Records
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-950/50 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-none"
              >
                Financial Standing
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-950/50 dark:data-[state=active]:text-amber-300 data-[state=active]:shadow-none"
              >
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="academic" className="mt-0 animate-fade-in">
              <Card className="shadow-card border border-border/60 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-background dark:from-blue-950/50 dark:to-background border-b border-border/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-blue-700 dark:text-blue-300">Academic Records</CardTitle>
                      <CardDescription>
                        Academic standing:{" "}
                        <Badge
                          variant="outline"
                          className={
                            student.academicRecords.academicStanding === "good"
                              ? "badge-success dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                              : student.academicRecords.academicStanding === "warning"
                                ? "badge-warning dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                                : "badge-danger dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
                          }
                        >
                          {student.academicRecords.academicStanding === "good"
                            ? "Good Standing"
                            : student.academicRecords.academicStanding === "warning"
                              ? "Academic Warning"
                              : "Academic Probation"}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download Transcript
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat-card">
                      <div className="stat-label">Total Credits</div>
                      <div className="stat-value text-blue-600">{student.academicRecords.totalCredits}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Credits Attempted</div>
                      <div className="stat-value text-blue-600">{student.academicRecords.creditsAttempted}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Credits Earned</div>
                      <div className="stat-value text-blue-600">{student.academicRecords.creditsEarned}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">GPA</div>
                      <div className="stat-value text-blue-600">{student.academicRecords.gpa.toFixed(2)}</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-blue-800 mb-3">Course History</h3>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Course Name</th>
                          <th>Semester</th>
                          <th>Credits</th>
                          <th>Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.academicRecords.courses.map((course) => (
                          <tr key={course.id}>
                            <td className="font-medium">{course.code}</td>
                            <td>{course.name}</td>
                            <td>
                              {course.semester} {course.year}
                            </td>
                            <td>{course.credits}</td>
                            <td
                              className={
                                course.grade?.startsWith("A")
                                  ? "text-emerald-600 font-medium"
                                  : course.grade?.startsWith("B")
                                    ? "text-blue-600 font-medium"
                                    : course.grade?.startsWith("C")
                                      ? "text-amber-600 font-medium"
                                      : course.grade?.startsWith("D") || course.grade?.startsWith("F")
                                        ? "text-red-600 font-medium"
                                        : ""
                              }
                            >
                              {course.grade || "-"}
                            </td>
                            <td>
                              <Badge
                                variant="outline"
                                className={
                                  course.status === "completed"
                                    ? "badge-success"
                                    : course.status === "in-progress"
                                      ? "badge-info"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                }
                              >
                                {course.status === "completed"
                                  ? "Completed"
                                  : course.status === "in-progress"
                                    ? "In Progress"
                                    : "Planned"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-0 animate-fade-in">
              <Card className="shadow-card border border-border/60 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-background dark:from-emerald-950/50 dark:to-background border-b border-border/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-emerald-700 dark:text-emerald-300">Financial Standing</CardTitle>
                      <CardDescription>
                        Account Balance:{" "}
                        <span
                          className={
                            student.financialStanding.accountBalance > 0
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-emerald-600 dark:text-emerald-400 font-medium"
                          }
                        >
                          ${student.financialStanding.accountBalance.toFixed(2)}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Statement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="stat-card">
                      <div className="stat-label">Tuition Total</div>
                      <div className="stat-value text-emerald-600">
                        ${student.financialStanding.tuitionTotal.toFixed(2)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Tuition Paid</div>
                      <div className="stat-value text-emerald-600">
                        ${student.financialStanding.tuitionPaid.toFixed(2)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Remaining Balance</div>
                      <div
                        className={`stat-value ${student.financialStanding.accountBalance > 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        ${student.financialStanding.accountBalance.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-emerald-800 mb-3">Financial Aid</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Name</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.financialStanding.financialAid.map((aid) => (
                          <tr key={aid.id}>
                            <td className="capitalize">{aid.type}</td>
                            <td>{aid.name}</td>
                            <td className="text-emerald-600 font-medium">${aid.amount.toFixed(2)}</td>
                            <td>
                              <Badge
                                variant="outline"
                                className={
                                  aid.status === "disbursed"
                                    ? "badge-success"
                                    : aid.status === "awarded"
                                      ? "badge-info"
                                      : "badge-warning"
                                }
                              >
                                {aid.status === "disbursed"
                                  ? "Disbursed"
                                  : aid.status === "awarded"
                                    ? "Awarded"
                                    : "Pending"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-lg font-medium text-emerald-800 mb-3">Recent Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.financialStanding.transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td className="capitalize">{transaction.type}</td>
                            <td
                              className={`font-medium ${transaction.amount < 0 ? "text-red-600" : "text-emerald-600"}`}
                            >
                              ${Math.abs(transaction.amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-0 animate-fade-in">
              <Card className="shadow-card border border-border/60 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-background dark:from-amber-950/50 dark:to-background border-b border-border/60">
                  <CardTitle className="text-amber-700 dark:text-amber-300">Achievements & Recognition</CardTitle>
                  <CardDescription>Student accomplishments and awards</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.achievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

// Achievement card component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "academic":
        return "badge-info dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
      case "service":
        return "badge-success dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
      case "leadership":
        return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
      case "spiritual":
        return "badge-warning dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-foreground">{achievement.name}</h3>
          <Badge variant="outline" className={getBadgeColor(achievement.type)}>
            {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(achievement.date)}
        </div>
      </div>
    </Card>
  )
}

// Helper function to get ordinal suffix
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}
