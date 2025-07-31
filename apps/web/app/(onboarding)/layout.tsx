'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Progress } from '@acu-apex/ui'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@acu-apex/utils'
import type { OnboardingStep } from '@/lib/onboarding/types'
import { getOnboardingData } from '@/lib/onboarding/storage'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

const STEP_INFO: Record<OnboardingStep, { title: string; order: number }> = {
  'role-selection': { title: 'Select Role', order: 1 },
  'pending-approval': { title: 'Pending Approval', order: 2 },
  'personal-info': { title: 'Personal Info', order: 3 },
  'photo-upload': { title: 'Photo Upload', order: 4 },
  'company-selection': { title: 'Select Company', order: 5 },
  'personality-assessments': { title: 'Assessments', order: 6 },
  'complete': { title: 'Complete', order: 7 }
}

function getCurrentStepFromPath(pathname: string): OnboardingStep {
  const step = pathname.split('/').pop() as OnboardingStep
  return Object.keys(STEP_INFO).includes(step) ? step : 'role-selection'
}

function getStepsForRole(role?: string): OnboardingStep[] {
  if (!role) return ['role-selection']
  
  switch (role) {
    case 'student':
      return ['role-selection', 'personal-info', 'photo-upload', 'company-selection', 'personality-assessments', 'complete']
    case 'student_leader':
      return ['role-selection', 'pending-approval', 'personal-info', 'photo-upload', 'company-selection', 'personality-assessments', 'complete']
    case 'staff':
      return ['role-selection', 'pending-approval', 'personal-info', 'photo-upload', 'personality-assessments', 'complete']
    default:
      return ['role-selection']
  }
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const pathname = usePathname()
  const currentStep = getCurrentStepFromPath(pathname)
  
  // Get role from local storage to determine which steps to show
  const onboardingData = getOnboardingData()
  const role = onboardingData.role
  const steps = getStepsForRole(role)
  
  const currentStepIndex = steps.indexOf(currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Getting Started</h1>
            <p className="text-sm text-muted-foreground">
              Complete your profile setup
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="w-24">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </header>

      {/* Step indicators */}
      {role && (
        <div className="border-b bg-muted/30">
          <div className="container px-4 py-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const stepInfo = STEP_INFO[step]
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex
                const isAccessible = index <= currentStepIndex
                
                return (
                  <div
                    key={step}
                    className={cn(
                      "flex flex-col items-center space-y-1 text-center flex-1",
                      isAccessible ? "opacity-100" : "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-secondary" />
                      ) : (
                        <Circle 
                          className={cn(
                            "h-6 w-6",
                            isCurrent 
                              ? "text-secondary fill-secondary" 
                              : "text-muted-foreground"
                          )} 
                        />
                      )}
                    </div>
                    <span 
                      className={cn(
                        "text-xs font-medium",
                        isCurrent 
                          ? "text-foreground" 
                          : isCompleted 
                            ? "text-secondary" 
                            : "text-muted-foreground"
                      )}
                    >
                      {stepInfo.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}