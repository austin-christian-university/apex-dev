'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Users, Shield, UserCog } from 'lucide-react'
import { cn } from '@acu-apex/utils'
import { saveOnboardingData } from '@/lib/onboarding/storage'

type Role = 'student' | 'officer' | 'staff'

interface RoleOption {
  value: Role
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'student',
    title: 'Student',
    description: 'I am a student participating in the ACU Blueprint program',
    icon: Users,
    badge: 'Most Common'
  },
  {
    value: 'officer',
    title: 'Company Officer',
    description: 'I am a student with leadership responsibilities in my company',
    icon: Shield
  },
  {
    value: 'staff',
    title: 'Staff',
    description: 'I am a faculty member or staff overseeing the program',
    icon: UserCog
  }
]

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
  }

  const handleContinue = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    
    try {
      // Save role selection to local storage
      saveOnboardingData({ role: selectedRole })

      // Determine next step based on role
      let nextStep: string
      switch (selectedRole) {
        case 'student':
          router.push('/personal-info')
          break
        case 'officer':
          router.push('/pending-approval')
          break
        case 'staff':
          router.push('/pending-approval')
          break
        default:
          router.push('/personal-info')
      }
    } catch (error) {
      console.error('Failed to save role selection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to ACU Blueprint</h1>
        <p className="text-lg text-muted-foreground">
          Let's get you set up. First, tell us your role in the program.
        </p>
      </div>

      <div className="grid gap-4">
        {ROLE_OPTIONS.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.value

          return (
            <Card
              key={role.value}
              className={cn(
                "cursor-pointer border-2 transition-all hover:shadow-md",
                isSelected 
                  ? "border-secondary bg-secondary/5" 
                  : "border-border hover:border-secondary/50"
              )}
              onClick={() => handleRoleSelect(role.value)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-secondary text-secondary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      {role.badge && (
                        <Badge variant="secondary" className="mt-1">
                          {role.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Radio button indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected 
                      ? "border-secondary bg-secondary" 
                      : "border-muted-foreground"
                  )}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-secondary-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {role.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        <div>
          {/* Empty space for alignment */}
        </div>
        
        <Button 
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}