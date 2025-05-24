"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStudentById, type Student, type ScoreCategory } from "@/lib/data"
import { useUserRole } from "@/lib/auth"
import { Mail, Calendar, Award, Building2, GraduationCap, Trophy, Clock, Target, TrendingUp, Edit2, Save, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Helper function to calculate category percentage
const calculateCategoryPercentage = (score: number | null | undefined, category: ScoreCategory): number => {
  if (score === null || score === undefined) return 0
  
  const maxScores: Record<ScoreCategory, number> = {
    lionGames: 100,
    attendance: 100,
    leadershipRoles: 100,
    serviceHours: 100,
    apartmentChecks: 100,
    eventExecution: 100,
    grades: 4.0
  }
  return (score / maxScores[category]) * 100
}

// Helper function to format category name
const formatCategoryName = (category: string) => {
  return category.replace(/([A-Z])/g, ' $1').trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function StudentProfilePage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState<Partial<Student>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [imageError, setImageError] = useState(false)
  const userRole = useUserRole()
  const { toast } = useToast()

  // Get initials for placeholder avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Get avatar image based on student data
  const getStudentAvatar = (student: Student) => {
    if (student.avatarUrl) {
      return student.avatarUrl
    }
    // Fallback to DiceBear with initials
    const initials = getInitials(student.name)
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=random&textColor=fff&fontSize=50`
  }

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true)
        const mockStudentId = process.env.NEXT_PUBLIC_MOCK_STUDENT_ID || "1"
        const fetchedStudent = await getStudentById(mockStudentId)
        if (fetchedStudent) {
          setStudent(fetchedStudent)
          setEditedStudent(fetchedStudent)
          // Set initial avatar preview
          const newAvatarSrc = fetchedStudent.avatarUrl || getStudentAvatar(fetchedStudent)
          setAvatarPreview(newAvatarSrc)
          setImageError(false)
        }
      } catch (error) {
        console.error("Error fetching student:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      if (!student) return

      // Update student data
      const updateData = {
        name: editedStudent.name,
        phoneNumber: editedStudent.phoneNumber,
        dateOfBirth: editedStudent.dateOfBirth,
        bio: editedStudent.bio,
      }

      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update student')
      }

      const updatedStudent = await response.json()
      setStudent({
        ...updatedStudent,
        score: student.score,
        scoreChangeHistory: student.scoreChangeHistory
      })
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof Student, value: string) => {
    setEditedStudent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setImageError(false)
      }
      reader.readAsDataURL(file)

      // Upload avatar immediately
      const formData = new FormData()
      formData.append('avatar', file)
      formData.append('studentId', student!.id)

      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar')
      }

      const { avatarUrl: newAvatarUrl } = await uploadResponse.json()
      
      // Update student data with new avatar URL
      const response = await fetch(`/api/students/${student!.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to update student')
      }

      const updatedStudent = await response.json()
      setStudent({
        ...updatedStudent,
        score: student!.score,
        scoreChangeHistory: student!.scoreChangeHistory
      })
      setAvatarPreview(newAvatarUrl)
      setImageError(false)
      setIsEditingAvatar(false)
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating avatar:', error)
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Add a new function to handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!student) return

    try {
      setIsUploading(true)
      
      // Update student data to remove avatar URL
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete avatar')
      }

      const updatedStudent = await response.json()
      setStudent({
        ...updatedStudent,
        score: student.score,
        scoreChangeHistory: student.scoreChangeHistory
      })
      setAvatarPreview('')
      setImageError(false)
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      })
    } catch (error) {
      console.error('Error deleting avatar:', error)
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
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
        <div>
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </div>
    )
  }

  // Calculate total score
  const totalScore = Object.entries(student.score)
    .filter(([key]) => key !== 'undefined') // Filter out undefined scores
    .reduce((sum, [_, score]) => sum + (score ?? 0), 0)

  // Split name into first and last name
  const [firstName, lastName] = student.name.split(' ')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and view performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-card border border-border/60 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center">
                <div className="relative -mt-16 mb-4 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-background">
                    {(avatarPreview && !imageError) ? (
                      <Image
                        src={avatarPreview}
                        alt={student.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={() => {
                          console.warn(`Failed to load image: ${avatarPreview}. Falling back to initials.`)
                          setImageError(true)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-4xl font-semibold text-primary">
                          {student ? getInitials(student.name) : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 pb-1">
                    <button
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                      disabled={isUploading}
                      title="Change avatar"
                    >
                      {isUploading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Edit2 className="h-4 w-4" />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploading}
                      />
                    </button>
                    {student.avatarUrl && (
                      <button
                        onClick={handleDeleteAvatar}
                        className="p-2 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
                        disabled={isUploading}
                        title="Remove avatar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
                  <div className="flex gap-2 justify-center mt-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {student.year}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {student.company}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {student.companyRole}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Editable Fields */}
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={isEditing ? editedStudent.name?.split(' ')[0] || firstName : firstName}
                        onChange={(e) => handleInputChange('name', `${e.target.value} ${lastName}`)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-transparent" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? editedStudent.name?.split(' ')[1] || lastName : lastName}
                        onChange={(e) => handleInputChange('name', `${firstName} ${e.target.value}`)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-transparent" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditing ? editedStudent.phoneNumber || student.phoneNumber : student.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-transparent" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={isEditing ? editedStudent.dateOfBirth || student.dateOfBirth : student.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-transparent" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedStudent.bio || student.bio : student.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      readOnly={!isEditing}
                      className={`min-h-[100px] ${!isEditing ? "bg-transparent" : ""}`}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={isEditing ? handleSave : handleEdit}
                    variant={isEditing ? "default" : "outline"}
                  >
                    {isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - Performance Metrics and History */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
              <TabsTrigger value="history">Score History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              {/* Overall Performance Card - Moved to top */}
              <Card className="shadow-card border border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Score</span>
                        <span className="font-medium">{totalScore}</span>
                      </div>
                      <Progress value={(totalScore / 700) * 100} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Rank</p>
                        <p className="text-2xl font-bold text-primary">#1</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Points This Month</p>
                        <p className="text-2xl font-bold text-emerald-600">+150</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance Card */}
              <Card className="shadow-card border border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Category Performance
                  </CardTitle>
                  <CardDescription>Detailed breakdown of performance across all categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(student.score)
                      .filter(([key]) => key !== 'undefined')
                      .map(([category, score]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              <span className="font-medium">{formatCategoryName(category)}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {(score ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <Progress 
                            value={calculateCategoryPercentage(score, category as ScoreCategory)} 
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="shadow-card border border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Track your score changes and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.scoreChangeHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No recent changes</p>
                    ) : (
                      student.scoreChangeHistory.map((change) => (
                        <div key={change.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{change.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(change.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
