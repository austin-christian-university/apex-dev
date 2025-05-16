"use client"

import { useState, useEffect } from "react"
import { StudentSelector } from "@/components/student-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, Search, ArrowUpDown } from "lucide-react"
import { getStudentById, type Student } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Input } from "@/components/ui/input"

export default function CourseRecordsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1")
  const [student, setStudent] = useState<Student | null>(null)
  const userRole = useUserRole()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchedStudent = getStudentById(selectedStudentId)
    if (fetchedStudent) {
      setStudent(fetchedStudent)
    }
  }, [selectedStudentId])

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
  }

  // Filter courses based on search term
  const filteredCourses =
    student?.academicRecords.courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">Course Records</h1>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Course Records</h1>
          <p className="text-muted-foreground">View and manage academic course history</p>
        </div>
        <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <Card className="shadow-card border border-border/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-border/60">
              <CardTitle className="text-blue-700">Academic Summary</CardTitle>
              <CardDescription>
                {student.name} - {student.major}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-md border border-blue-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium text-primary-900">{student.studentId}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      student.academicRecords.academicStanding === "good"
                        ? "badge-success"
                        : student.academicRecords.academicStanding === "warning"
                          ? "badge-warning"
                          : "badge-danger"
                    }
                  >
                    {student.academicRecords.academicStanding === "good"
                      ? "Good Standing"
                      : student.academicRecords.academicStanding === "warning"
                        ? "Academic Warning"
                        : "Academic Probation"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <div className="stat-label">GPA</div>
                    <div className="stat-value text-blue-600">{student.academicRecords.gpa.toFixed(2)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Credits Earned</div>
                    <div className="stat-value text-blue-600">{student.academicRecords.creditsEarned}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Credits Attempted</p>
                    <p className="text-sm text-muted-foreground">{student.academicRecords.creditsAttempted}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Total Credits</p>
                      <p className="text-sm text-muted-foreground">{student.academicRecords.totalCredits}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    View Unofficial Transcript
                  </Button>
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Official Transcript
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-card border border-border/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-border/60">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-blue-700">Course History</CardTitle>
                  <CardDescription>Complete record of courses taken</CardDescription>
                </div>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8 w-full md:w-[200px] bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="flex items-center">
                        Code
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-1">
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </th>
                      <th>Course Name</th>
                      <th>Semester</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-blue-50/50">
                          <td className="font-medium text-blue-700">{course.code}</td>
                          <td>{course.name}</td>
                          <td>
                            {course.semester} {course.year}
                          </td>
                          <td>{course.credits}</td>
                          <td>
                            {course.grade ? (
                              <span
                                className={
                                  course.grade.startsWith("A")
                                    ? "text-emerald-600 font-medium"
                                    : course.grade.startsWith("B")
                                      ? "text-blue-600 font-medium"
                                      : course.grade.startsWith("C")
                                        ? "text-amber-600 font-medium"
                                        : "text-red-600 font-medium"
                                }
                              >
                                {course.grade}
                              </span>
                            ) : (
                              "-"
                            )}
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "No courses match your search" : "No courses found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-card border border-border/60 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-border/60 pb-3">
                <CardTitle className="text-blue-700">Current Semester</CardTitle>
                <CardDescription>Fall 2023</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {student.academicRecords.courses
                    .filter((course) => course.status === "in-progress")
                    .map((course) => (
                      <div
                        key={course.id}
                        className="p-3 border border-border rounded-md hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-primary-900">{course.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {course.code} • {course.credits} credits
                            </p>
                          </div>
                          <Badge variant="outline" className="badge-info">
                            In Progress
                          </Badge>
                        </div>
                      </div>
                    ))}

                  {student.academicRecords.courses.filter((course) => course.status === "in-progress").length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-blue-100 p-3 mb-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-muted-foreground">No courses in progress</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border border-border/60 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-border/60 pb-3">
                <CardTitle className="text-blue-700">Degree Progress</CardTitle>
                <CardDescription>Credits toward graduation</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Total Credits</p>
                      <p className="text-sm text-muted-foreground">{student.academicRecords.totalCredits} / 120</p>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar progress-bar-blue"
                        style={{ width: `${(student.academicRecords.totalCredits / 120) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {Math.round((student.academicRecords.totalCredits / 120) * 100)}% complete
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Major Requirements</p>
                      <p className="text-sm text-muted-foreground">24 / 36</p>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar progress-bar-green" style={{ width: `${(24 / 36) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{Math.round((24 / 36) * 100)}% complete</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">General Education</p>
                      <p className="text-sm text-muted-foreground">30 / 42</p>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar progress-bar-violet" style={{ width: `${(30 / 42) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{Math.round((30 / 42) * 100)}% complete</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Electives</p>
                      <p className="text-sm text-muted-foreground">18 / 30</p>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar progress-bar-amber" style={{ width: `${(18 / 30) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{Math.round((18 / 30) * 100)}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
