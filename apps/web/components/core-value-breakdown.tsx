"use client"

import { useState, useEffect } from "react"
import { Edit, Save, Info, Plus, Minus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUserRole } from "@/lib/auth"
import { getStudentById, students } from "@/lib/data"
import { Progress } from "@/components/ui/progress"

interface CoreValueBreakdownProps {
  studentId: string
  pillar?: string
}

// Define the type for subcategory scores
type SubcategoryScores = {
  [key: string]: number
}

// Map pillar keys to display names, colors, and subcategories
const PILLAR_INFO: Record<string, { label: string; color: string; subcategories: string[] }> = {
  christCentered: {
    label: "Christ Centered",
    color: "violet",
    subcategories: [
      "Spiritual Formation Activities",
      "Scripture Engagement",
      "Mission & Outreach Involvement",
      "Character Development",
    ],
  },
  excellence: {
    label: "Excellence",
    color: "blue",
    subcategories: [
      "Academic Performance",
      "Professional Skills & Development",
      "Analytical & Problem-Solving Abilities",
      "Innovation & Creative Projects",
    ],
  },
  service: {
    label: "Service",
    color: "emerald",
    subcategories: [
      "Direct Service Hours",
      "Leadership in Service Initiatives",
      "Promoting a Culture of Service",
      "Compassionate Action & Empathy",
    ],
  },
  community: {
    label: "Community",
    color: "amber",
    subcategories: [
      "Campus Engagement & Leadership",
      "Collaborative Contributions",
      "Positive Campus Citizenship",
      "Exploration of Vocation & Calling",
    ],
  },
}

export function CoreValueBreakdown({ studentId, pillar = "christCentered" }: CoreValueBreakdownProps) {
  const userRole = useUserRole()
  const [isEditing, setIsEditing] = useState(false)
  const student = getStudentById(studentId)

  const info = PILLAR_INFO[pillar] || PILLAR_INFO.christCentered
  const pillarData = student?.pillars?.[pillar as keyof typeof student.pillars]

  // Initialize categories with actual data from student
  const [editedData, setEditedData] = useState<{
    score: number
    categories: SubcategoryScores
    notes: string
  }>({
    score: pillarData?.score || 0,
    categories: pillarData?.subcategories || {},
    notes: "Student is showing consistent improvement in this area.",
  })

  // Update local state when student data changes
  useEffect(() => {
    if (student && pillarData) {
      setEditedData(prev => ({
        ...prev,
        score: pillarData.score,
        categories: pillarData.subcategories
      }))
    }
  }, [student, pillar])

  const canEdit = userRole === "admin" || userRole === "leader"

  const calculateNewPillarScore = (categories: SubcategoryScores) => {
    const values = Object.values(categories)
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
  }

  const updateStudentData = (newCategories: SubcategoryScores) => {
    const newScore = calculateNewPillarScore(newCategories)
    
    // Update the student data in our dummy data
    const studentIndex = students.findIndex(s => s.id === studentId)
    if (studentIndex !== -1) {
      students[studentIndex] = {
        ...students[studentIndex],
        pillars: {
          ...students[studentIndex].pillars,
          [pillar]: {
            score: newScore,
            subcategories: newCategories
          }
        }
      }
    }
  }

  const handleScoreChange = (subcategory: string, change: number) => {
    if (!canEdit) return

    setEditedData(prev => {
      const newCategories = {
        ...prev.categories,
        [subcategory]: Math.max(0, Math.min(100, prev.categories[subcategory] + change))
      }
      
      const newScore = calculateNewPillarScore(newCategories)
      
      // Update the student data
      updateStudentData(newCategories)

      return {
        ...prev,
        score: newScore,
        categories: newCategories
      }
    })
  }

  const handleSave = () => {
    // Update the student data with final values
    updateStudentData(editedData.categories)
    setIsEditing(false)
  }

  const handleCategoryChange = (category: string, value: number) => {
    setEditedData(prev => {
      const newCategories = {
        ...prev.categories,
        [category]: value
      }
      
      const newScore = calculateNewPillarScore(newCategories)
      
      return {
        ...prev,
        score: newScore,
        categories: newCategories
      }
    })
  }

  const handleNotesChange = (notes: string) => {
    setEditedData((prev) => ({
      ...prev,
      notes,
    }))
  }

  // Color helpers
  const color = info.color
  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case "blue":
        return "progress-bar-blue"
      case "violet":
        return "progress-bar-violet"
      case "emerald":
        return "progress-bar-green"
      case "amber":
        return "progress-bar-amber"
      default:
        return "progress-bar-blue"
    }
  }
  const getHeaderGradient = (colorName: string) => {
    switch (colorName) {
      case "blue":
        return "from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent"
      case "violet":
        return "from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent"
      case "emerald":
        return "from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent"
      case "amber":
        return "from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent"
      default:
        return "from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent"
    }
  }
  const getTextColor = (colorName: string) => {
    switch (colorName) {
      case "blue":
        return "text-blue-700 dark:text-blue-400"
      case "violet":
        return "text-violet-700 dark:text-violet-400"
      case "emerald":
        return "text-emerald-700 dark:text-emerald-400"
      case "amber":
        return "text-amber-700 dark:text-amber-400"
      default:
        return "text-blue-700 dark:text-blue-400"
    }
  }
  const getBorderColor = (colorName: string) => {
    switch (colorName) {
      case "blue":
        return "border-blue-200 dark:border-blue-800/50"
      case "violet":
        return "border-violet-200 dark:border-violet-800/50"
      case "emerald":
        return "border-emerald-200 dark:border-emerald-800/50"
      case "amber":
        return "border-amber-200 dark:border-amber-800/50"
      default:
        return "border-blue-200 dark:border-blue-800/50"
    }
  }

  if (!student) {
    return <div>Loading...</div>
  }

  return (
    <Card className="shadow-card border border-border/60 overflow-hidden card-glow transition-all duration-300">
      <CardHeader className={`pb-3 bg-gradient-to-r ${getHeaderGradient(color)} border-b ${getBorderColor(color)}`}>
        <div className="flex justify-between items-center">
          <CardTitle className={getTextColor(color)}>{info.label}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getTextColor(color)}`}>
              {isEditing ? editedData.score : pillarData?.score}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>This score represents the average of all subcategory scores in the {info.label} core value.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription>Breakdown of performance in {info.label.toLowerCase()} categories</CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          {Object.entries(editedData.categories).map(([category, value]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{category}</span>
                  {userRole !== "student" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleScoreChange(category, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleScoreChange(category, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {canEdit && isEditing ? editedData.categories[category] : value}/100
                </div>
              </div>
              {canEdit && isEditing ? (
                <Slider
                  value={[editedData.categories[category]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleCategoryChange(category, value[0])}
                  className={getTextColor(color)}
                />
              ) : (
                <div className="progress-container">
                  <div className={`progress-bar ${getColorClass(color)}`} style={{ width: `${value}%` }} />
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 mt-2 border-t border-border">
            <div className="flex items-center mb-2">
              <div className="text-sm font-medium">Notes</div>
              {!isEditing && editedData.notes && (
                <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
                  Feedback provided
                </div>
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={editedData.notes || ""}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes about this core value..."
                className="min-h-[100px] resize-none"
              />
            ) : (
              <div className="text-sm text-muted-foreground bg-secondary/50 dark:bg-secondary/20 p-3 rounded-md">
                {editedData.notes || (canEdit ? "No notes added yet. Click Edit Values to add feedback." : "")}
              </div>
            )}
          </div>
        </div>
        {/* Only show edit/save/cancel buttons if canEdit is true */}
        {canEdit && (
          <CardFooter className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="bg-primary text-white">
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" /> Edit Values
              </Button>
            )}
          </CardFooter>
        )}
      </CardContent>
    </Card>
  )
}
