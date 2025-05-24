"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStudentById, type Student, type Admin, type ScoreCategory } from "@/lib/data"
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

// Add type for user data
type UserData = {
  type: "student" | "admin"
  user: Student | Admin
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<Student | Admin>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()

  // Get initials for placeholder avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Get avatar image based on user data
  const getUserAvatar = (user: Student | Admin) => {
    if (user.avatarUrl) {
      return user.avatarUrl
    }
    // Fallback to DiceBear with initials
    const initials = getInitials(user.name)
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=random&textColor=fff&fontSize=50`
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Get user data from localStorage
        const storedUserType = localStorage.getItem("userType")
        const storedUserData = localStorage.getItem("userData")
        
        if (!storedUserType || !storedUserData) {
          console.error("No user data found in localStorage")
          return
        }

        const userType = storedUserType as "student" | "admin"
        const user = JSON.parse(storedUserData) as Student | Admin

        // For students, fetch the latest data
        if (userType === "student") {
          const updatedStudent = await getStudentById(user.id)
          if (updatedStudent) {
            setUserData({ type: "student", user: updatedStudent })
            setEditedUser(updatedStudent)
            const newAvatarSrc = updatedStudent.avatarUrl || getUserAvatar(updatedStudent)
            setAvatarPreview(newAvatarSrc)
          }
        } else {
          // For admins, use the stored data
          setUserData({ type: "admin", user })
          setEditedUser(user)
          const newAvatarSrc = user.avatarUrl || getUserAvatar(user)
          setAvatarPreview(newAvatarSrc)
        }
        
        setImageError(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try logging in again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      if (!userData) return

      // Update user data
      const updateData = {
        name: editedUser.name,
        phoneNumber: editedUser.phoneNumber,
        bio: editedUser.bio,
        ...(userData.type === "student" && {
          dateOfBirth: (editedUser as Student).dateOfBirth,
        }),
      }

      const endpoint = userData.type === "student" 
        ? `/api/students/${userData.user.id}`
        : `/api/admins/${userData.user.id}`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${userData.type}`)
      }

      const updatedUser = await response.json()
      
      // Preserve score data for students
      if (userData.type === "student") {
        const student = userData.user as Student
        setUserData({
          type: "student",
          user: {
            ...updatedUser,
            score: student.score,
            scoreChangeHistory: student.scoreChangeHistory
          }
        })
      } else {
        setUserData({ type: "admin", user: updatedUser })
      }

      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof Student | keyof Admin, value: string) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData) return

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
      formData.append('studentId', userData.user.id)

      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload avatar')
      }

      const { avatarUrl: newAvatarUrl } = await uploadResponse.json()
      
      // Update user data with new avatar URL
      const endpoint = userData.type === "student" 
        ? `/api/students/${userData.user.id}`
        : `/api/admins/${userData.user.id}`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedUser = await response.json()
      
      // Preserve score data for students
      if (userData.type === "student") {
        const student = userData.user as Student
        setUserData({
          type: "student",
          user: {
            ...updatedUser,
            score: student.score,
            scoreChangeHistory: student.scoreChangeHistory
          }
        })
      } else {
        setUserData({ type: "admin", user: updatedUser })
      }

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
    if (!userData) return

    try {
      setIsUploading(true)
      
      const endpoint = userData.type === "student" 
        ? `/api/students/${userData.user.id}`
        : `/api/admins/${userData.user.id}`

      // Update user data to remove avatar URL
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarUrl: null }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete avatar')
      }

      const updatedUser = await response.json()
      
      // Preserve score data for students
      if (userData.type === "student") {
        const student = userData.user as Student
        setUserData({
          type: "student",
          user: {
            ...updatedUser,
            score: student.score,
            scoreChangeHistory: student.scoreChangeHistory
          }
        })
      } else {
        setUserData({ type: "admin", user: updatedUser })
      }

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
      <div className="space-y-6 w-[100vw] h-[100vh] mx-auto p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">My Profile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const user = userData.user
  const isStudent = userData.type === "student"

  // Calculate total score for students
  const totalScore = isStudent 
    ? Object.entries((user as Student).score)
        .filter(([key]) => key !== 'undefined')
        .reduce((sum, [_, score]) => sum + (score ?? 0), 0)
    : 0

  // Split name into first and last name
  const [firstName, lastName] = user.name.split(' ')

  return (
    <div className="w-[100vw] mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile information{isStudent ? " and view performance metrics" : ""}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:max-w-[70vw]">
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
                        alt={user.name}
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
                          {user ? getInitials(user.name) : ""}
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
                    {user.avatarUrl && (
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
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <div className="flex gap-2 justify-center mt-2">
                    {isStudent && (
                      <>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {(user as Student).year}
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {(user as Student).company}
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {(user as Student).companyRole}
                        </Badge>
                      </>
                    )}
                    {!isStudent && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Administrator
                      </Badge>
                    )}
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
                        value={isEditing ? editedUser.name?.split(' ')[0] || firstName : firstName}
                        onChange={(e) => handleInputChange('name', `${e.target.value} ${lastName}`)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-transparent" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? editedUser.name?.split(' ')[1] || lastName : lastName}
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
                      value={isEditing ? editedUser.phoneNumber || user.phoneNumber : user.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-transparent" : ""}
                    />
                  </div>

                  {isStudent && (
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={isEditing ? (editedUser as Student).dateOfBirth || (user as Student).dateOfBirth : (user as Student).dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-transparent" : ""}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={isEditing ? editedUser.bio || user.bio : user.bio}
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

        {/* Main Content Area - Performance Metrics and History (only for students) */}
        {isStudent && (
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
                      {Object.entries((user as Student).score)
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
                      {((user as Student).scoreChangeHistory.length === 0) ? (
                        <p className="text-muted-foreground text-center py-4">No recent changes</p>
                      ) : (
                        ((user as Student).scoreChangeHistory.map((change) => (
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
