'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Clock, Shield, UserCog, ChevronRight } from 'lucide-react'
import { getOnboardingData } from '@/lib/onboarding/storage'

export default function PendingApprovalPage() {
  const [role, setRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get role from local storage
    const data = getOnboardingData()
    if (data.role) {
      setRole(data.role)
    } else {
      // If no role found, redirect back to role selection
      router.push('/role-selection')
    }
  }, [router])

  const handleContinue = () => {
    setIsLoading(true)
    // Navigate to personal info page
    router.push('/personal-info')
  }

  const handleGoBack = () => {
    router.push('/role-selection')
  }

  const getRoleInfo = () => {
    switch (role) {
      case 'student_leader':
        return {
          title: 'Student Leader Role Pending',
          icon: Shield,
          description: 'Your request for student leader privileges is pending approval from program administrators.',
          capabilities: [
            'View additional student performance data',
            'Access company leadership tools',
            'Manage company events and activities',
            'Generate company reports'
          ]
        }
      case 'staff':
        return {
          title: 'Staff Role Pending',
          icon: UserCog,
          description: 'Your request for staff privileges is pending approval from program administrators.',
          capabilities: [
            'Access all student and company data',
            'Generate comprehensive reports',
            'Manage program settings and configurations',
            'Oversee multiple companies and students'
          ]
        }
      default:
        return {
          title: 'Role Pending',
          icon: Clock,
          description: 'Your role request is pending approval.',
          capabilities: []
        }
    }
  }

  if (!role) {
    return <div>Loading...</div>
  }

  const roleInfo = getRoleInfo()
  const Icon = roleInfo.icon

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-secondary/10 rounded-full">
            <Icon className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">{roleInfo.title}</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          {roleInfo.description}
        </p>
      </div>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>You can continue with onboarding now.</strong> Your elevated privileges will be activated on your next login after approval.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>What happens next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-secondary">1</span>
              </div>
              <div>
                <p className="font-medium">Continue Setup</p>
                <p className="text-sm text-muted-foreground">Complete your profile and finish onboarding</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">2</span>
              </div>
              <div>
                <p className="font-medium">Admin Review</p>
                <p className="text-sm text-muted-foreground">Program administrators will review your role request</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">3</span>
              </div>
              <div>
                <p className="font-medium">Privileges Activated</p>
                <p className="text-sm text-muted-foreground">Your {role === 'student_leader' ? 'leadership' : 'staff'} access will be enabled on approval</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {roleInfo.capabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What you'll gain access to:</CardTitle>
            <CardDescription>
              These features will be available once your role is approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roleInfo.capabilities.map((capability, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-secondary" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleGoBack}>
          Back
        </Button>
        
        <Button onClick={handleContinue} disabled={isLoading} size="lg">
          {isLoading ? 'Loading...' : 'Continue Setup'}
        </Button>
      </div>
    </div>
  )
}