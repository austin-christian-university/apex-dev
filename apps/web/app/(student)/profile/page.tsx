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
import { Alert, AlertDescription } from "@acu-apex/ui"
import { GraduationCap, DollarSign, TrendingUp, Pencil, ChevronDown, ChevronUp, AlertTriangle, Camera, Loader2 } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { useState, useEffect, useRef } from "react"
import { useAuth } from '@/components/auth/auth-provider'
import { getStudentProfileData } from '@/lib/profile-data'
import { ProfileLoadingSkeleton } from '@/components/loading-skeletons'
import { formatGradeDisplay } from '@acu-apex/utils'
import { handlePhotoUpload } from '@/lib/photo-utils'
import { updateUserPhoto, updateUserProfile } from '@/lib/profile-actions'
import { PhotoCropSelector } from '@/components/photo-crop-selector'
import type { RecentActivity, PopuliAcademicRecord, PopuliFinancialInfo, Student, Company, User, StudentHolisticGPA } from '@acu-apex/types'

interface CategoryBreakdown {
  category_id: string
  category_name: string
  category_display_name: string
  category_score: number
  subcategories: Array<{
    subcategory_id: string
    subcategory_name: string
    subcategory_display_name: string
    subcategory_score: number
    data_points_count?: number
  }>
}

// Mock data removed - using real data from API







const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig



export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false)
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [showCropSelector, setShowCropSelector] = useState(false)
  const [originalPhotoForCrop, setOriginalPhotoForCrop] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Real profile data
  const [profileData, setProfileData] = useState<{
    user: User | null
    student: Student | null
    company: Company | null
    holisticGPA: StudentHolisticGPA | null
    recentActivity: RecentActivity[]
    populiData: {
      academic: PopuliAcademicRecord[] | null
      financial: PopuliFinancialInfo | null
      error?: string
    } | null
  }>({
    user: null,
    student: null,
    company: null,
    holisticGPA: null,
    recentActivity: [],
    populiData: null
  })

  const [editableProfile, setEditableProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    disc_profile: '',
    myers_briggs_profile: '',
    enneagram_profile: ''
  })

  // Load profile data on component mount
  useEffect(() => {
    async function loadProfileData() {
      if (!authUser?.id) return

      setLoading(true)
      setError(null)

      try {
        const result = await getStudentProfileData(authUser.id)
        
        setProfileData({
          user: result.user || null,
          student: result.student || null,
          company: result.company || null,
          holisticGPA: result.holisticGPA || null,
          recentActivity: result.recentActivity || [],
          populiData: result.populiData || null
        })

          // Initialize editable profile with user data
          if (result.user) {
            setEditableProfile({
              first_name: result.user.first_name || '',
              last_name: result.user.last_name || '',
              email: result.user.email || '',
              phone_number: result.user.phone_number || '',
              date_of_birth: result.user.date_of_birth || '',
              disc_profile: result.user.disc_profile || '',
              myers_briggs_profile: result.user.myers_briggs_profile || '',
              enneagram_profile: result.user.enneagram_profile || ''
            })
          }
      } catch (err) {
        console.error('Error loading profile data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [authUser?.id])

  const handleProfileUpdate = (field: string, value: string) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profileData.user) return

    setIsUploadingPhoto(true)
    setError(null)

    try {
      const result = await handlePhotoUpload(file)
      if (result.error) {
        setError(result.error)
        return
      }

      if (result.needsCropping) {
        // Show crop selector
        setOriginalPhotoForCrop(result.originalBase64)
        setShowCropSelector(true)
      }
    } catch (err) {
      console.error('Photo upload error:', err)
      setError('Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCropComplete = async (croppedBase64: string) => {
    if (!profileData.user) return

    setIsUploadingPhoto(true)
    setError(null)

    try {
      const updateResult = await updateUserPhoto(profileData.user.id, croppedBase64)
      if (updateResult.success) {
        // Update the local profile data to show the new photo immediately
        setProfileData(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, photo: croppedBase64 } : null
        }))
        setShowCropSelector(false)
        setOriginalPhotoForCrop('')
      } else {
        setError(updateResult.error || 'Failed to update photo')
      }
    } catch (err) {
      console.error('Photo save error:', err)
      setError('Failed to save photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleCropCancel = () => {
    setShowCropSelector(false)
    setOriginalPhotoForCrop('')
    setIsUploadingPhoto(false)
  }

  const handleSaveProfile = async () => {
    if (!profileData.user) return

    setIsSavingProfile(true)
    setError(null)

    try {
      const result = await updateUserProfile(profileData.user.id, editableProfile)
      if (result.success) {
        // Update the local profile data
        setProfileData(prev => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...editableProfile } : null
        }))
        setIsHeaderExpanded(false)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Profile save error:', err)
      setError('Failed to save profile')
    } finally {
      setIsSavingProfile(false)
    }
  }



  // Show loading state
  if (loading) {
    return (
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <ProfileLoadingSkeleton />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { user, company, holisticGPA, recentActivity, populiData } = profileData

  if (!user) {
    return (
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>User data not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Generate radar chart data from real holistic GPA data
  const breakdownList = holisticGPA && holisticGPA.category_breakdown ? 
    Object.values(holisticGPA.category_breakdown as unknown as Record<string, CategoryBreakdown>) : []
  const radarChartData = breakdownList.map((cat: CategoryBreakdown) => ({
    categoryId: cat.category_id,
    pillar: (cat.category_display_name || cat.category_name || '').replace(' Standing', '').replace(' Performance', '').replace(' Execution', ''),
    score: Number(cat.category_score) || 0,
    fullScore: 4.0
  }))

  // Show crop selector if needed
  if (showCropSelector && originalPhotoForCrop) {
    return (
      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <PhotoCropSelector
          imageBase64={originalPhotoForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isProcessing={isUploadingPhoto}
        />
      </div>
    )
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
                    <AvatarImage src={user.photo || ""} />
                    <AvatarFallback className="text-lg">
                      {(user.first_name?.[0] || '').toUpperCase()}{(user.last_name?.[0] || '').toUpperCase()}
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
                  <h1 className="text-xl font-bold">{user.first_name} {user.last_name}</h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-secondary font-medium">{company?.name || 'No Company'}</p>
                </div>
                <div className="ml-auto">
                  {isHeaderExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{typeof holisticGPA?.holistic_gpa === 'number' ? holisticGPA.holistic_gpa.toFixed(2) : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Holistic GPA</p>
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="px-6 pb-6 pt-0">
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Edit Profile</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </>
                    )}
                  </Button>
                </div>
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
                      value={editableProfile.myers_briggs_profile || ''}
                      onChange={(e) => handleProfileUpdate('myers_briggs_profile', e.target.value)}
                      placeholder="e.g., INTJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enneagram">Enneagram</Label>
                    <Input
                      id="enneagram"
                      value={editableProfile.enneagram_profile || ''}
                      onChange={(e) => handleProfileUpdate('enneagram_profile', e.target.value)}
                      placeholder="e.g., Type 5 - The Investigator"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsHeaderExpanded(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
                
                {/* Hidden file input for photo upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileSelect}
                  className="hidden"
                />
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
          {holisticGPA ? (
            <Card>
              <CardHeader className="items-center">
                <CardTitle>Holistic GPA Breakdown</CardTitle>
                <CardDescription>
                  Tap any pillar to see detailed breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0 px-2">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[270px] w-full"
                >
                  <RadarChart data={radarChartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12 }} />
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
                      onClick={() => {
                        // Radar chart click handling - would need proper recharts event typing
                        // For now, this is a placeholder for future enhancement
                      }}
                    />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="items-center">
                <CardTitle>Holistic GPA Breakdown</CardTitle>
                <CardDescription>
                  Your holistic GPA is being calculated
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your holistic GPA hasn&apos;t been calculated yet. This usually happens after you submit your first few activities and events. Check back soon!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Academic Record</h2>
            </div>
            
            {!user.populi_id ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your academic records from Populi aren&apos;t linked yet. Please contact staff to link your account for academic data.
                </AlertDescription>
              </Alert>
            ) : populiData?.error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to fetch academic data from Populi: {populiData.error}
                </AlertDescription>
              </Alert>
            ) : populiData?.academic && populiData.academic.length > 0 ? (
              populiData.academic.map((semester) => (
                <Card key={semester.semester}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{semester.semester}</CardTitle>
                      <Badge variant="secondary">GPA: {semester.gpa.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {semester.courses.map((course, index) => (
                      <div key={`${course.code}-${index}`} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{course.code}</p>
                          <p className="text-muted-foreground text-xs">{course.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatGradeDisplay(course.grade)}</p>
                          <p className="text-muted-foreground text-xs">{course.credits} credits</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No academic records found. Academic data may not be available yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Financial Overview</h2>
            </div>
            
            {!user.populi_id ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your financial records from Populi aren&apos;t linked yet. Please contact staff to link your account for financial data.
                </AlertDescription>
              </Alert>
            ) : populiData?.error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to fetch financial data from Populi: {populiData.error}
                </AlertDescription>
              </Alert>
            ) : populiData?.financial ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {populiData.financial.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tuition Balance</p>
                      <p className="text-lg font-bold">${populiData.financial.tuition_balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Financial Aid</p>
                      <p className="text-lg font-bold text-green-600">${populiData.financial.financial_aid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scholarships</p>
                      <p className="text-lg font-bold text-green-600">${populiData.financial.scholarships.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Work Study</p>
                      <p className="text-lg font-bold text-green-600">${populiData.financial.work_study.toLocaleString()}</p>
                    </div>
                  </div>
                  {(populiData.financial.last_payment || populiData.financial.next_due_date) && (
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {populiData.financial.last_payment && (
                          <div>
                            <p className="text-muted-foreground">Last Payment</p>
                            <p className="font-medium">{populiData.financial.last_payment}</p>
                          </div>
                        )}
                        {populiData.financial.next_due_date && (
                          <div>
                            <p className="text-muted-foreground">Next Due Date</p>
                            <p className="font-medium">{populiData.financial.next_due_date}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Note: Financial aid, scholarships, and work study amounts are not yet accurate. We will update these values in a future release.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No financial data found. Financial information may not be available yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.submission_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium pt-2 pl-2">{activity.event_name}</p>
                        </div>
                        <div className="text-right">
                          {activity.status ? (
                            <span className={`text-sm font-bold ${
                              activity.status === 'Present' || activity.status === 'Involved' 
                                ? 'text-green-600' 
                                : activity.status === 'Absent' 
                                ? 'text-red-600' 
                                : 'text-yellow-600'
                            }`}>
                              {activity.status}
                            </span>
                          ) : activity.points_earned !== undefined ? (
                            <span className="text-sm font-bold text-secondary">+{activity.points_earned} pts</span>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No recent activity found. Start submitting events and activities to see your progress here!
                  </p>
                </CardContent>
              </Card>
            )}
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
          {selectedPillar && holisticGPA && (() => {
            const breakdownEntries = Object.values((holisticGPA.category_breakdown || {}) as unknown as Record<string, CategoryBreakdown>)
            const category = breakdownEntries.find((cat: CategoryBreakdown) => (cat.category_display_name || cat.category_name) === selectedPillar)
            if (!category) return null
            
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Overall Score:</span>
                  <span className="text-2xl font-bold">{Number(category.category_score || 0).toFixed(2)}/4.0</span>
                </div>
                <div className="space-y-3">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.subcategory_id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{subcategory.subcategory_display_name || subcategory.subcategory_name}</span>
                        <div className="text-right">
                          <span className="font-bold">{Number(subcategory.subcategory_score || 0).toFixed(2)}/4.0</span>
                          {subcategory.data_points_count != null && (
                            <span className="text-muted-foreground ml-2">({subcategory.data_points_count} activities)</span>
                          )}
                        </div>
                      </div>
                      <Progress value={((Number(subcategory.subcategory_score || 0)) / 4.0) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    This score is calculated based on your activity submissions and normalized using a bell curve distribution.
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