'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { CheckCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { getOnboardingData, validateOnboardingData, clearOnboardingData } from '@/lib/onboarding/storage'
import { syncOnboardingDataToSupabase } from '@/lib/onboarding/sync'
import type { OnboardingData } from '@acu-apex/types'

type SyncStatus = 'pending' | 'syncing' | 'success' | 'error'

export default function CompletePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('pending')
  const [error, setError] = useState<string>('')
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    missingFields: string[]
  }>({ isValid: false, missingFields: [] })

  useEffect(() => {
    // Load and validate onboarding data
    const data = getOnboardingData()
    setOnboardingData(data)
    
    const validation = validateOnboardingData(data)
    setValidationResult(validation)

    if (!validation.isValid) {
      // Redirect to fix missing data
      redirectToMissingStep(validation.missingFields, data)
    }
  }, [])

  const redirectToMissingStep = (missingFields: string[], data: Partial<OnboardingData>) => {
    if (missingFields.includes('role')) {
      router.push('/role-selection')
    } else if (missingFields.includes('first_name') || missingFields.includes('last_name') || 
               missingFields.includes('email') || missingFields.includes('phone_number')) {
      router.push('/personal-info')
    } else if (missingFields.includes('company_id') && data.role !== 'staff') {
      router.push('/company-selection')
    }
  }

  const handleSync = async () => {
    if (!user?.id || !validationResult.isValid) return

    setSyncStatus('syncing')
    setError('')

    try {
      const result = await syncOnboardingDataToSupabase(
        onboardingData as OnboardingData,
        user.id
      )

      if (result.success) {
        setSyncStatus('success')
        // Wait a moment for the success animation, then redirect
        setTimeout(() => {
          redirectToDashboard()
        }, 2000)
      } else {
        setSyncStatus('error')
        setError(result.error || 'Failed to complete onboarding')
      }
    } catch (error) {
      setSyncStatus('error')
      setError('An unexpected error occurred while completing your onboarding')
      console.error('Onboarding sync error:', error)
    }
  }

  const redirectToDashboard = () => {
    if (onboardingData.role === 'staff') {
      router.push('/staff')
    } else {
      router.push('/home')
    }
  }

  const handleRetry = () => {
    setSyncStatus('pending')
    setError('')
  }

  const handleGoBack = () => {
    router.push('/personality-assessments')
  }

  const getCompletedAssessments = () => {
    const assessments = []
    if (onboardingData.disc_profile) assessments.push('DISC')
    if (onboardingData.myers_briggs_profile) assessments.push('Myers-Briggs')
    if (onboardingData.enneagram_profile) assessments.push('Enneagram')
    return assessments
  }

  const formatFieldName = (field: string) => {
    const fieldNames: Record<string, string> = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'email': 'Email',
      'phone_number': 'Phone Number',
      'company_id': 'Company Selection',
      'role': 'Role Selection'
    }
    return fieldNames[field] || field
  }

  if (!validationResult.isValid) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Incomplete Information</h1>
          <p className="text-lg text-muted-foreground">
            Please complete all required fields before finishing onboarding
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Missing required information:</p>
              <ul className="list-disc list-inside text-sm">
                {validationResult.missingFields.map((field) => (
                  <li key={field}>{formatFieldName(field)}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center pt-6">
          <Button onClick={() => redirectToMissingStep(validationResult.missingFields, onboardingData)}>
            Complete Missing Information
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${
            syncStatus === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-secondary/10'
          }`}>
            {syncStatus === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : syncStatus === 'syncing' ? (
              <Loader2 className="h-8 w-8 text-secondary animate-spin" />
            ) : (
              <Sparkles className="h-8 w-8 text-secondary" />
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold">
          {syncStatus === 'success' ? 'Welcome to ACU Apex!' : 'Ready to Complete!'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {syncStatus === 'success' 
            ? 'Your onboarding is complete. Redirecting to your dashboard...'
            : 'Review your information and complete your onboarding'
          }
        </p>
      </div>

      {syncStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {syncStatus !== 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information Summary</CardTitle>
            <CardDescription>
              Please review your details before completing onboarding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{onboardingData.first_name} {onboardingData.last_name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-base capitalize">{onboardingData.role?.replace('_', ' ')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{onboardingData.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{onboardingData.phone_number}</p>
              </div>

              {onboardingData.date_of_birth && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-base">{new Date(onboardingData.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}

              {onboardingData.photo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Photo</p>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={onboardingData.photo} 
                      alt="Profile preview" 
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <span className="text-sm text-muted-foreground">Uploaded</span>
                  </div>
                </div>
              )}
            </div>

            {onboardingData.company_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-base">{onboardingData.company_name}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Personality Assessments</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getCompletedAssessments().length > 0 ? (
                  getCompletedAssessments().map((assessment) => (
                    <span 
                      key={assessment}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-secondary/20 text-secondary text-sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {assessment}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None completed</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {syncStatus === 'success' && (
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Onboarding Complete!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your profile has been successfully created. You'll be redirected to your dashboard momentarily.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {syncStatus !== 'success' && (
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleGoBack} disabled={syncStatus === 'syncing'}>
            Back
          </Button>
          
          <div className="space-x-3">
            {syncStatus === 'error' && (
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
            )}
            <Button 
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              size="lg"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Complete Onboarding'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}