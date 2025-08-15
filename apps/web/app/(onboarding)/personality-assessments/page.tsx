'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Brain, AlertTriangle, ExternalLink, CheckCircle, Loader2 } from 'lucide-react'
import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding/storage'
import { DISC_PROFILES, MYERS_BRIGGS_TYPES, ENNEAGRAM_TYPES } from '@/lib/onboarding/types'

interface AssessmentData {
  disc_profile: string
  myers_briggs_profile: string
  enneagram_profile: string
}

export default function PersonalityAssessmentsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string>('')
  const [showWarning, setShowWarning] = useState(false)

  const [assessments, setAssessments] = useState<AssessmentData>({
    disc_profile: '',
    myers_briggs_profile: '',
    enneagram_profile: ''
  })

  useEffect(() => {
    // Load existing data and validate navigation
    const onboardingData = getOnboardingData()
    
    if (!onboardingData.role) {
      router.push('/role-selection')
      return
    }

    if (!onboardingData.first_name || !onboardingData.last_name) {
      router.push('/personal-info')
      return
    }

    // Check if company selection is required but missing
    if (onboardingData.role !== 'staff' && !onboardingData.company_id) {
      router.push('/company-selection')
      return
    }

    setRole(onboardingData.role)

    // Load existing assessment data
    setAssessments({
      disc_profile: onboardingData.disc_profile || '',
      myers_briggs_profile: onboardingData.myers_briggs_profile || '',
      enneagram_profile: onboardingData.enneagram_profile || ''
    })
  }, [router])

  const handleAssessmentChange = (type: keyof AssessmentData, value: string) => {
    setAssessments(prev => ({ ...prev, [type]: value }))
    setShowWarning(false) // Hide warning when user selects something
  }

  const getCompletedCount = () => {
    return Object.values(assessments).filter(value => value !== '').length
  }

  const handleContinue = async () => {
    const completedCount = getCompletedCount()
    
    // Show warning if no assessments are completed
    if (completedCount === 0) {
      setShowWarning(true)
      return
    }

    setIsLoading(true)

    try {
      // Save assessment data to local storage
      const dataToSave: Partial<AssessmentData> = {}
      if (assessments.disc_profile) dataToSave.disc_profile = assessments.disc_profile
      if (assessments.myers_briggs_profile) dataToSave.myers_briggs_profile = assessments.myers_briggs_profile
      if (assessments.enneagram_profile) dataToSave.enneagram_profile = assessments.enneagram_profile

      saveOnboardingData(dataToSave)

      // Navigate to completion page
      router.push('/complete')
    } catch (error) {
      console.error('Failed to save assessment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    if (role === 'staff') {
      router.push('/personal-info')
    } else {
      router.push('/company-selection')
    }
  }

  const handleSkipWarning = () => {
    setIsLoading(true)
    
    // Save empty assessment data and continue
    saveOnboardingData({
      disc_profile: assessments.disc_profile || undefined,
      myers_briggs_profile: assessments.myers_briggs_profile || undefined,
      enneagram_profile: assessments.enneagram_profile || undefined
    })
    
    router.push('/complete')
  }

  const completedCount = getCompletedCount()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-secondary/10 rounded-full">
            <Brain className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Personality Assessments</h1>
        <p className="text-lg text-muted-foreground">
          These assessments help us understand your personality and working style
        </p>
        <div className="flex justify-center">
          <Badge variant="secondary">
            {completedCount} of 3 completed
          </Badge>
        </div>
      </div>

      {showWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-medium">We recommend completing at least one assessment</p>
            <p className="text-sm">
              These help your company leaders understand how to work with you most effectively. 
              You can always add them later in your profile settings.
            </p>
            <div className="flex space-x-2 mt-3">
              <Button size="sm" variant="outline" onClick={handleSkipWarning}>
                Skip for now
              </Button>
              <Button size="sm" onClick={() => setShowWarning(false)}>
                I&apos;ll complete one
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* DISC Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>DISC Profile</span>
                  {assessments.disc_profile && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Measures your natural behavioral style and communication preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disc-select">Select your DISC profile</Label>
              <Select 
                value={assessments.disc_profile} 
                onValueChange={(value) => handleAssessmentChange('disc_profile', value)}
              >
                <SelectTrigger id="disc-select">
                  <SelectValue placeholder="Choose your DISC profile..." />
                </SelectTrigger>
                <SelectContent>
                  {DISC_PROFILES.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Don&apos;t know your DISC profile? </span>
              <a 
                href="https://www.123test.com/disc-personality-test/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Take a free assessment
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Myers-Briggs Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Myers-Briggs Type</span>
                  {assessments.myers_briggs_profile && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Identifies how you perceive the world and make decisions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mbti-select">Select your Myers-Briggs type</Label>
              <Select 
                value={assessments.myers_briggs_profile} 
                onValueChange={(value) => handleAssessmentChange('myers_briggs_profile', value)}
              >
                <SelectTrigger id="mbti-select">
                  <SelectValue placeholder="Choose your Myers-Briggs type..." />
                </SelectTrigger>
                <SelectContent>
                  {MYERS_BRIGGS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Don&apos;t know your type? </span>
              <a 
                href="https://www.16personalities.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Take the 16personalities test
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Enneagram Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Enneagram Type</span>
                  {assessments.enneagram_profile && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  Reveals your core motivations and fears that drive behavior
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enneagram-select">Select your Enneagram type</Label>
              <Select 
                value={assessments.enneagram_profile} 
                onValueChange={(value) => handleAssessmentChange('enneagram_profile', value)}
              >
                <SelectTrigger id="enneagram-select">
                  <SelectValue placeholder="Choose your Enneagram type..." />
                </SelectTrigger>
                <SelectContent>
                  {ENNEAGRAM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>Don&apos;t know your type? </span>
              <a 
                href="https://www.eclecticenergies.com/enneagram/test" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Take a free Enneagram test
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-secondary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Why do we collect this?</p>
              <p className="text-sm text-muted-foreground">
                Understanding personality types helps company leaders provide better mentorship, 
                form effective teams, and create environments where everyone can thrive. This information 
                is only shared with your company leadership and program administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleGoBack}>
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Continue'}
        </Button>
      </div>
    </div>
  )
}