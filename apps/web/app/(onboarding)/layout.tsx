'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Progress } from '@acu-apex/ui'

import { cn } from '@acu-apex/utils'
import type { OnboardingStep } from '@/lib/onboarding/types'
import { STUDENT_STEPS, STUDENT_LEADER_STEPS, STAFF_STEPS } from '@/lib/onboarding/types'
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
      return STUDENT_STEPS
    case 'officer': // student_leader is now officer
      return STUDENT_LEADER_STEPS
    case 'staff':
      return STAFF_STEPS
    case 'admin':
      return STAFF_STEPS // admins follow same flow as staff
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
            <Image
              src="/images/acu_stacked_white.png"
              alt="ACU"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
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



      {/* Main content */}
      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}