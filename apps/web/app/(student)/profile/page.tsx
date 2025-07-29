'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Progress } from "@acu-apex/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acu-apex/ui"
import { User, GraduationCap, DollarSign, Calendar, TrendingUp, BookOpen } from "lucide-react"

// Mock data - will be replaced with real data later
const mockUserProfile = {
  name: "Alex Morgan",
  email: "alex.morgan@acu.edu",
  studentId: "ACU2024001",
  dateOfBirth: "March 15, 2002",
  major: "Computer Science",
  year: "Junior",
  expectedGraduation: "May 2025",
  company: "Alpha Company",
  avatar: null,
  holisticGPA: 3.92,
  cumulativeGPA: 3.88
}

const mockFourPillarsDetailed = [
  {
    name: "Spiritual Standing",
    score: 3.95,
    components: [
      { name: "Chapel Attendance", score: 4.0, weight: 40 },
      { name: "Small Group Participation", score: 3.8, weight: 30 },
      { name: "Community Service", score: 4.0, weight: 30 }
    ]
  },
  {
    name: "Professional Standing", 
    score: 3.85,
    components: [
      { name: "Leadership Roles", score: 3.9, weight: 35 },
      { name: "Certifications", score: 3.7, weight: 25 },
      { name: "Practicum Performance", score: 3.95, weight: 40 }
    ]
  },
  {
    name: "Academic Performance",
    score: 3.88,
    components: [
      { name: "Class Attendance", score: 3.95, weight: 20 },
      { name: "Course Grades", score: 3.85, weight: 70 },
      { name: "Academic Achievements", score: 3.9, weight: 10 }
    ]
  },
  {
    name: "Team Execution",
    score: 4.0,
    components: [
      { name: "Company Team Building", score: 4.0, weight: 40 },
      { name: "GBE Participation", score: 4.0, weight: 30 },
      { name: "Community Events", score: 4.0, weight: 30 }
    ]
  }
]

const mockFinancialInfo = {
  tuitionBalance: 15420.50,
  financialAid: 8500.00,
  scholarships: 3000.00,
  workStudy: 2400.00,
  lastPayment: "January 15, 2024",
  nextDueDate: "February 15, 2024",
  status: "Good Standing"
}

const mockAcademicRecord = [
  {
    semester: "Fall 2023",
    courses: [
      { code: "CS 351", name: "Data Structures", grade: "A", credits: 3 },
      { code: "BIBL 343", name: "New Testament", grade: "A-", credits: 3 },
      { code: "MATH 325", name: "Statistics", grade: "B+", credits: 3 },
      { code: "ENG 211", name: "World Literature", grade: "A", credits: 3 }
    ],
    gpa: 3.83
  },
  {
    semester: "Spring 2023", 
    courses: [
      { code: "CS 211", name: "Programming Fundamentals", grade: "A", credits: 4 },
      { code: "BIBL 101", name: "Biblical Foundations", grade: "A-", credits: 3 },
      { code: "MATH 151", name: "Calculus I", grade: "B+", credits: 4 },
      { code: "COMM 111", name: "Communication Principles", grade: "A", credits: 3 }
    ],
    gpa: 3.79
  }
]

const mockRecentActivity = [
  {
    date: "2 days ago",
    type: "Academic",
    description: "Submitted CS 351 final project",
    points: "+15 points"
  },
  {
    date: "5 days ago", 
    type: "Service",
    description: "Completed 4 hours at local food bank",
    points: "+8 points"
  },
  {
    date: "1 week ago",
    type: "Team",
    description: "Attended Alpha Company team building",
    points: "+12 points"
  },
  {
    date: "2 weeks ago",
    type: "Professional",
    description: "Earned AWS Cloud Practitioner certification",
    points: "+25 points"
  }
]

export default function ProfilePage() {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Profile Header */}
      <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mockUserProfile.avatar || ""} />
              <AvatarFallback className="text-lg">
                {mockUserProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{mockUserProfile.name}</h1>
              <p className="text-sm text-muted-foreground">{mockUserProfile.email}</p>
              <p className="text-sm text-secondary font-medium">{mockUserProfile.company}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{mockUserProfile.holisticGPA}</p>
              <p className="text-xs text-muted-foreground">Holistic GPA</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mockUserProfile.cumulativeGPA}</p>
              <p className="text-xs text-muted-foreground">Academic GPA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student ID</p>
                  <p className="font-medium">{mockUserProfile.studentId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{mockUserProfile.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Major</p>
                  <p className="font-medium">{mockUserProfile.major}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p className="font-medium">{mockUserProfile.year}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-muted-foreground text-sm">Expected Graduation</p>
                <p className="font-medium">{mockUserProfile.expectedGraduation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Four Pillars Breakdown */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Holistic GPA Breakdown</h2>
            {mockFourPillarsDetailed.map((pillar) => (
              <Card key={pillar.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pillar.name}</CardTitle>
                    <span className="text-lg font-bold">{pillar.score}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pillar.components.map((component) => (
                    <div key={component.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{component.name}</span>
                        <span className="font-medium">{component.score}</span>
                      </div>
                      <Progress value={component.score * 25} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Academic Record</h2>
            </div>
            
            {mockAcademicRecord.map((semester) => (
              <Card key={semester.semester}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{semester.semester}</CardTitle>
                    <Badge variant="secondary">GPA: {semester.gpa}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {semester.courses.map((course) => (
                    <div key={course.code} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{course.code}</p>
                        <p className="text-muted-foreground text-xs">{course.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{course.grade}</p>
                        <p className="text-muted-foreground text-xs">{course.credits} credits</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Financial Overview</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Status</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {mockFinancialInfo.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tuition Balance</p>
                    <p className="text-lg font-bold">${mockFinancialInfo.tuitionBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Financial Aid</p>
                    <p className="text-lg font-bold text-green-600">${mockFinancialInfo.financialAid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Scholarships</p>
                    <p className="text-lg font-bold text-green-600">${mockFinancialInfo.scholarships.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Work Study</p>
                    <p className="text-lg font-bold text-green-600">${mockFinancialInfo.workStudy.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Payment</p>
                      <p className="font-medium">{mockFinancialInfo.lastPayment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Due Date</p>
                      <p className="font-medium">{mockFinancialInfo.nextDueDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            
            <div className="space-y-2">
              {mockRecentActivity.map((activity, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{activity.date}</span>
                        </div>
                        <p className="text-sm font-medium">{activity.description}</p>
                      </div>
                      <span className="text-sm font-bold text-secondary">{activity.points}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 