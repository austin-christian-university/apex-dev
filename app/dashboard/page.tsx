"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FourPillarsChart } from "@/components/four-pillars-chart"
import { HistoricalChart } from "@/components/historical-chart"
import { StudentSelector } from "@/components/student-selector"
import { CoreValueBreakdown } from "@/components/core-value-breakdown"
import { ScoreAdjuster } from "@/components/score-adjuster"
import { getAllStudents, getStudentById } from "@/lib/data"

// Define the new pillars and subcategories
const PILLARS = [
  {
    key: "christCentered",
    label: "Christ Centered",
    subcategories: [
      "Spiritual Formation Activities",
      "Scripture Engagement",
      "Mission & Outreach Involvement",
      "Character Development",
    ],
  },
  {
    key: "excellence",
    label: "Excellence",
    subcategories: [
      "Academic Performance",
      "Professional Skills & Development",
      "Analytical & Problem-Solving Abilities",
      "Innovation & Creative Projects",
    ],
  },
  {
    key: "service",
    label: "Service",
    subcategories: [
      "Direct Service Hours",
      "Leadership in Service Initiatives",
      "Promoting a Culture of Service",
      "Compassionate Action & Empathy",
    ],
  },
  {
    key: "community",
    label: "Community",
    subcategories: [
      "Campus Engagement & Leadership",
      "Collaborative Contributions",
      "Positive Campus Citizenship",
      "Exploration of Vocation & Calling",
    ],
  },
]

export default function DashboardPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1")
  const [selectedPillar, setSelectedPillar] = useState<string>("academic")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch students data
    const allStudents = getAllStudents()
    setStudents(allStudents)

    if (allStudents.length > 0) {
      setSelectedStudentId(allStudents[0].id)
    }

    setIsLoading(false)
  }, [])

  const handleScoreChange = (pillar: string, change: number, comment?: string, evidence?: string) => {
    console.log(`Changed ${pillar} by ${change}`, { comment, evidence })
    // In a real app, this would update the database
  }

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const selectedStudent = getStudentById(selectedStudentId)

  if (!selectedStudent) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Student not found</h2>
        <p className="text-muted-foreground mt-2">Please select a different student.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Four Pillars Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage student progress across the Four Pillars of Austin Christian University.
          </p>
        </div>

        <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 z-0" />
            <CardHeader className="relative z-10">
              <CardTitle>Four Pillars Index</CardTitle>
              <CardDescription>Current standing across all four pillars</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {selectedStudent.pillars && <FourPillarsChart data={selectedStudent.pillars} />}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-1"
        >
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 z-0" />
            <CardHeader className="relative z-10">
              <CardTitle>Core Value Breakdown</CardTitle>
              <CardDescription>Detailed analysis of each pillar</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Tabs defaultValue={selectedPillar} onValueChange={setSelectedPillar}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="christCentered">Christ Centered</TabsTrigger>
                  <TabsTrigger value="excellence">Excellence</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="community">Community</TabsTrigger>
                </TabsList>
                <TabsContent value="christCentered">
                  <CoreValueBreakdown studentId={selectedStudentId} pillar="christCentered" />
                </TabsContent>
                <TabsContent value="excellence">
                  <CoreValueBreakdown studentId={selectedStudentId} pillar="excellence" />
                </TabsContent>
                <TabsContent value="service">
                  <CoreValueBreakdown studentId={selectedStudentId} pillar="service" />
                </TabsContent>
                <TabsContent value="community">
                  <CoreValueBreakdown studentId={selectedStudentId} pillar="community" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle>Score Adjustment</CardTitle>
            <CardDescription>Add or remove points from each pillar with supporting evidence</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ScoreAdjuster
              studentId={selectedStudentId}
              studentName={selectedStudent.name}
              onScoreChange={handleScoreChange}
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 z-0" />
          <CardHeader className="relative z-10">
            <CardTitle>Historical Progress</CardTitle>
            <CardDescription>Track progress over time across all pillars</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chart">Chart View</TabsTrigger>
                <TabsTrigger value="table">Table View</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="pt-4">
                {selectedStudent.history && <HistoricalChart data={selectedStudent.history} />}
              </TabsContent>
              <TabsContent value="table" className="pt-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Christ Centered</th>
                        <th className="p-2 text-left font-medium">Excellence</th>
                        <th className="p-2 text-left font-medium">Service</th>
                        <th className="p-2 text-left font-medium">Community</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.history &&
                        selectedStudent.history.map((record, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{record.date}</td>
                            <td className="p-2">{record.spiritual}</td>
                            <td className="p-2">{record.academic}</td>
                            <td className="p-2">{record.physical}</td>
                            <td className="p-2">{record.social}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
