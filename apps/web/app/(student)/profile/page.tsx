'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Progress } from "@acu-apex/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acu-apex/ui"
import { Button } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Label } from "@acu-apex/ui"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@acu-apex/ui"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@acu-apex/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@acu-apex/ui"
import { User, GraduationCap, DollarSign, Calendar, TrendingUp, BookOpen, Pencil, ChevronDown, ChevronUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { useState } from "react"

// Mock data - will be replaced with real data later
const mockUserProfile = {
  id: "1",
  first_name: "Alex",
  last_name: "Morgan",
  email: "alex.morgan@acu.edu",
  phone_number: "+1 (555) 123-4567",
  date_of_birth: "2002-03-15",
  photo: null,
  disc_profile: "D - Dominance",
  myers_briggs: "INTJ",
  enneagram: "Type 5 - The Investigator",
  studentId: "ACU2024001",
  major: "Computer Science",
  year: "Junior",
  expectedGraduation: "May 2025",
  company: "Alpha Company",
  avatar: null,
  holisticGPA: 3.92,
  cumulativeGPA: 3.88,
  get name() { return `${this.first_name} ${this.last_name}` }
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

// Radar chart data for Four Pillars
const radarChartData = [
  {
    pillar: "Spiritual",
    score: 3.95,
    fullScore: 4.0
  },
  {
    pillar: "Professional", 
    score: 3.85,
    fullScore: 4.0
  },
  {
    pillar: "Academic",
    score: 3.88,
    fullScore: 4.0
  },
  {
    pillar: "Team",
    score: 4.0,
    fullScore: 4.0
  }
]

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

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
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [editableProfile, setEditableProfile] = useState(mockUserProfile)

  const handleProfileUpdate = (field: string, value: string) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePillarClick = (pillarName: string) => {
    const pillar = mockFourPillarsDetailed.find(p => p.name.includes(pillarName))
    if (pillar) {
      setSelectedPillar(pillar.name)
    }
  }

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Expandable Profile Header */}
      <Collapsible open={isHeaderExpanded} onOpenChange={setIsHeaderExpanded}>
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
          <CollapsibleTrigger asChild>
            <CardContent className="p-6 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={editableProfile.avatar || editableProfile.photo || ""} />
                    <AvatarFallback className="text-lg">
                      {editableProfile.first_name[0]}{editableProfile.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold">{editableProfile.name}</h1>
                  <p className="text-sm text-muted-foreground">{editableProfile.email}</p>
                  <p className="text-sm text-secondary font-medium">{editableProfile.company}</p>
                </div>
                <div className="ml-auto">
                  {isHeaderExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{mockUserProfile.holisticGPA}</p>
                  <p className="text-xs text-muted-foreground">Holistic GPA</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="px-6 pb-6 pt-0">
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Edit Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editableProfile.first_name}
                      onChange={(e) => handleProfileUpdate('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editableProfile.last_name}
                      onChange={(e) => handleProfileUpdate('last_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editableProfile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editableProfile.phone_number}
                    onChange={(e) => handleProfileUpdate('phone_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editableProfile.date_of_birth}
                    onChange={(e) => handleProfileUpdate('date_of_birth', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disc">DISC Profile</Label>
                    <Input
                      id="disc"
                      value={editableProfile.disc_profile || ''}
                      onChange={(e) => handleProfileUpdate('disc_profile', e.target.value)}
                      placeholder="e.g., D - Dominance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="myers_briggs">Myers-Briggs</Label>
                    <Input
                      id="myers_briggs"
                      value={editableProfile.myers_briggs || ''}
                      onChange={(e) => handleProfileUpdate('myers_briggs', e.target.value)}
                      placeholder="e.g., INTJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enneagram">Enneagram</Label>
                    <Input
                      id="enneagram"
                      value={editableProfile.enneagram || ''}
                      onChange={(e) => handleProfileUpdate('enneagram', e.target.value)}
                      placeholder="e.g., Type 5 - The Investigator"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsHeaderExpanded(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Here you would save the changes
                    console.log('Saving profile changes:', editableProfile)
                    setIsHeaderExpanded(false)
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
          {/* Interactive Radar Chart */}
          <Card>
            <CardHeader className="items-center">
              <CardTitle>Holistic GPA Breakdown</CardTitle>
              <CardDescription>
                Tap any pillar to see detailed breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <RadarChart data={radarChartData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="pillar" />
                  <PolarGrid />
                  <Radar
                    dataKey="score"
                    fill="var(--color-score)"
                    fillOpacity={0.6}
                    dot={{
                      r: 6,
                      fillOpacity: 1,
                      cursor: "pointer",
                    }}
                    onClick={(data: any) => {
                      if (data && data.payload) {
                        handlePillarClick(data.payload.pillar)
                      }
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
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

      {/* Pillar Detail Modal */}
      <Dialog open={!!selectedPillar} onOpenChange={() => setSelectedPillar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPillar || "Pillar"} - Detailed Breakdown
            </DialogTitle>
            <DialogDescription>
              Components that make up your {selectedPillar?.toLowerCase() || "pillar"} score
            </DialogDescription>
          </DialogHeader>
          {selectedPillar && (() => {
            const pillar = mockFourPillarsDetailed.find(p => p.name === selectedPillar)
            if (!pillar) return null
            
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Overall Score:</span>
                  <span className="text-2xl font-bold">{pillar.score}/4.0</span>
                </div>
                <div className="space-y-3">
                  {pillar.components.map((component) => (
                    <div key={component.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{component.name}</span>
                        <div className="text-right">
                          <span className="font-bold">{component.score}/4.0</span>
                          <span className="text-muted-foreground ml-2">({component.weight}%)</span>
                        </div>
                      </div>
                      <Progress value={(component.score / 4.0) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    This score is calculated based on the weighted average of the components above.
                  </p>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
} 