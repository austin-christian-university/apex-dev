'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@acu-apex/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@acu-apex/ui"
import { Button } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Award, Briefcase, Heart, Users } from "lucide-react"
import { CommunityServiceForm, JobPromotionForm, CredentialsForm, TeamParticipationForm } from "@/components/event-forms"
import { 
  submitCommunityServiceEventAction, 
  submitJobPromotionEventAction, 
  submitCredentialsEventAction,
  submitTeamParticipationEventAction
} from "@/lib/staff-actions"
import { useAuth } from "@/components/auth/auth-provider"
import type { CommunityServiceSubmission, JobPromotionSubmission, CredentialsSubmission, TeamParticipationSubmission } from "@acu-apex/types"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitSuccess?: () => void
}

type EventType = 'community_service' | 'job_promotion' | 'credentials' | 'team_participation' | null

const eventTypes = [
  {
    value: 'community_service' as const,
    label: 'Community Service Hours',
    description: 'Volunteer work and community service activities',
    icon: Heart,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    value: 'job_promotion' as const,
    label: 'Job Promotion',
    description: 'Career advancement and workplace promotions',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    value: 'credentials' as const,
    label: 'Credentials',
    description: 'Certifications, licenses, and educational achievements',
    icon: Award,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    value: 'team_participation' as const,
    label: 'Team Participation',
    description: 'Participation in Fellow Friday Team or Chapel Team',
    icon: Users,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
  }
]

export function AddEventDialog({ open, onOpenChange, onSubmitSuccess }: AddEventDialogProps) {
  const { user } = useAuth()
  const [selectedEventType, setSelectedEventType] = useState<EventType>(null)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEventTypeSelect = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setShowForm(true)
  }

  const handleBackToSelection = () => {
    setShowForm(false)
    setSelectedEventType(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedEventType(null)
    setIsSubmitting(false)
    onOpenChange(false)
    onSubmitSuccess?.()
  }

  const handleSubmitCommunityService = async (data: CommunityServiceSubmission) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    
    setIsSubmitting(true)
    try {
      const result = await submitCommunityServiceEventAction(user.id, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      handleFormSuccess()
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  const handleSubmitJobPromotion = async (data: JobPromotionSubmission) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    
    setIsSubmitting(true)
    try {
      const result = await submitJobPromotionEventAction(user.id, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      handleFormSuccess()
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  const handleSubmitCredentials = async (data: CredentialsSubmission) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    
    setIsSubmitting(true)
    try {
      const result = await submitCredentialsEventAction(user.id, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      handleFormSuccess()
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  const handleSubmitTeamParticipation = async (data: TeamParticipationSubmission) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }
    
    setIsSubmitting(true)
    try {
      const result = await submitTeamParticipationEventAction(user.id, data)
      if (!result.success) { 
        throw new Error(result.error)
      }
      handleFormSuccess()
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowForm(false)
      setSelectedEventType(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col mx-4 sm:max-w-2xl sm:w-full">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {showForm ? 'Submit Event' : 'Add Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
          {!showForm ? (
            // Event Type Selection
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Record your achievements and activities that contribute to your Holistic GPA.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-medium">Select Event Type</h3>
                
                <div className="grid gap-3">
                  {eventTypes.map((eventType) => {
                    const IconComponent = eventType.icon
                    return (
                      <button
                        key={eventType.value}
                        onClick={() => handleEventTypeSelect(eventType.value)}
                        className="p-4 border rounded-lg hover:border-primary/50 transition-colors text-left group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                            <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm group-hover:text-primary">
                                {eventType.label}
                              </h4>
                              <Badge className={eventType.color}>
                                New
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {eventType.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> These submissions will be reviewed by staff before being added to your Holistic GPA.
                </p>
              </div>
            </div>
          ) : (
            // Event Form
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToSelection}
                  className="px-2"
                  disabled={isSubmitting}
                >
                  ← Back
                </Button>
                <div className="text-sm text-muted-foreground">
                  {eventTypes.find(et => et.value === selectedEventType)?.label}
                </div>
              </div>
              
              {selectedEventType === 'community_service' && (
                <CommunityServiceForm
                  onSubmit={handleSubmitCommunityService}
                  onCancel={handleBackToSelection}
                  isSubmitting={isSubmitting}
                />
              )}
              
              {selectedEventType === 'job_promotion' && (
                <JobPromotionForm
                  onSubmit={handleSubmitJobPromotion}
                  onCancel={handleBackToSelection}
                  isSubmitting={isSubmitting}
                />
              )}
              
              {selectedEventType === 'credentials' && (
                <CredentialsForm
                  onSubmit={handleSubmitCredentials}
                  onCancel={handleBackToSelection}
                  isSubmitting={isSubmitting}
                />
              )}
              
              {selectedEventType === 'team_participation' && (
                <TeamParticipationForm
                  onSubmit={handleSubmitTeamParticipation}
                  onCancel={handleBackToSelection}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}