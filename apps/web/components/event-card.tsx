'use client'

import { useState, memo } from 'react'
import { Card, CardContent } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Dialog, DialogContent } from '@acu-apex/ui'
import { Clock, CheckCircle } from 'lucide-react'
import { AttendanceForm } from './attendance-form'
import { MonthlyCheckinForm } from './monthly-checkin-form'
import { CompanyParticipationForm } from './event-forms'
import { toast } from '@acu-apex/ui'

interface EventCardProps {
  event: {
    id: string
    name: string
    description: string | null
    due_date: string | null
    event_type: string
    subcategory_id?: string | null
  }
  studentId: string
  formattedDueDate: string
  isUrgent?: boolean
  isPastDue?: boolean
  variant?: 'urgent' | 'upcoming'
  hasSubmitted?: boolean
  isEligibleForAttendance?: boolean
  isEligibleForMonthlyCheckin?: boolean
  isEligibleForParticipation?: boolean
}

export const EventCard = memo(function EventCard({ 
  event, 
  studentId, 
  formattedDueDate, 
  isUrgent, 
  isPastDue,
  variant = 'upcoming',
  hasSubmitted: initialHasSubmitted = false,
  isEligibleForAttendance: initialIsEligible = false,
  isEligibleForMonthlyCheckin: initialIsEligibleForCheckin = false,
  isEligibleForParticipation: initialIsEligibleForParticipation = false
}: EventCardProps) {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showMonthlyCheckinForm, setShowMonthlyCheckinForm] = useState(false)
  const [showParticipationForm, setShowParticipationForm] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(initialHasSubmitted)

  const handleCardClick = () => {
    if (event.event_type === 'attendance' && initialIsEligible && !hasSubmitted) {
      setShowAttendanceForm(true)
    } else if (event.event_type === 'monthly_checkin' && initialIsEligibleForCheckin && !hasSubmitted) {
      setShowMonthlyCheckinForm(true)
    } else if (event.event_type === 'participation' && initialIsEligibleForParticipation && !hasSubmitted) {
      setShowParticipationForm(true)
    }
  }

  const handleAttendanceSuccess = () => {
    setShowAttendanceForm(false)
    setHasSubmitted(true)
    toast({
      title: "Attendance Recorded",
      description: "Your attendance has been successfully submitted.",
    })
    
    // The server action already calls revalidatePath('/home') which will refresh the data
    // The optimistic update above ensures immediate UI feedback
  }

  const handleMonthlyCheckinSuccess = () => {
    setShowMonthlyCheckinForm(false)
    setHasSubmitted(true)
    toast({
      title: "Weekly Check-In Submitted",
      description: "Your weekly involvement check-in has been successfully submitted.",
    })
    
    // The server action already calls revalidatePath('/home') which will refresh the data
    // The optimistic update above ensures immediate UI feedback
  }

  const handleParticipationSuccess = () => {
    setShowParticipationForm(false)
    setHasSubmitted(true)
    toast({
      title: "Participation Scores Submitted",
      description: "Participation scores have been successfully submitted.",
    })
    
    // The server action already calls revalidatePath('/home') which will refresh the data
    // The optimistic update above ensures immediate UI feedback
  }

  const isClickable = (event.event_type === 'attendance' && initialIsEligible && !hasSubmitted) || 
                     (event.event_type === 'monthly_checkin' && initialIsEligibleForCheckin && !hasSubmitted) ||
                     (event.event_type === 'participation' && initialIsEligibleForParticipation && !hasSubmitted)
  const cardClassName = `
    ${variant === 'urgent' ? 'border-destructive/20 bg-destructive/5' : ''}
    ${isClickable ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}
  `

  return (
    <>
      <Card className={cardClassName} onClick={handleCardClick}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{event.name}</h3>
                {(event.event_type === 'attendance' || event.event_type === 'monthly_checkin' || event.event_type === 'participation') && hasSubmitted && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {event.description || 'No description available'}
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-xs font-medium ${isPastDue ? 'text-destructive' : isUrgent ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {formattedDueDate}
                </p>
                {isClickable && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {event.event_type === 'attendance' ? 'Tap to record attendance' : 
                       event.event_type === 'monthly_checkin' ? 'Tap to submit check-in' : 
                       event.event_type === 'participation' ? 'Tap to score participation' :
                       'Tap to submit'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {variant === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  {isPastDue ? 'Overdue' : 'Urgent'}
                </Badge>
              )}
              {variant === 'upcoming' && (
                <Badge 
                  variant={isUrgent ? "secondary" : "outline"} 
                  className={`text-xs capitalize ${isUrgent ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}`}
                >
                  {isUrgent ? 'Due Soon' : event.event_type.replace('_', ' ')}
                </Badge>
              )}
              {(event.event_type === 'attendance' || event.event_type === 'monthly_checkin' || event.event_type === 'participation') && hasSubmitted && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  Submitted
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form Dialog */}
      <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
        <DialogContent className="sm:max-w-md">
          <AttendanceForm
            event={{
              id: event.id,
              name: event.name,
              due_date: event.due_date
            }}
            studentId={studentId}
            onSuccess={handleAttendanceSuccess}
            onCancel={() => setShowAttendanceForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Monthly Check-In Form Dialog */}
      <Dialog open={showMonthlyCheckinForm} onOpenChange={setShowMonthlyCheckinForm}>
        <DialogContent className="sm:max-w-md">
          <MonthlyCheckinForm
            event={{
              id: event.id,
              name: event.name,
              due_date: event.due_date,
              subcategory_id: event.subcategory_id || undefined
            }}
            studentId={studentId}
            onSuccess={handleMonthlyCheckinSuccess}
            onCancel={() => setShowMonthlyCheckinForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Participation Form Dialog */}
      <Dialog open={showParticipationForm} onOpenChange={setShowParticipationForm}>
        <DialogContent className="sm:max-w-lg">
          <CompanyParticipationForm
            event={{
              id: event.id,
              name: event.name,
              description: event.description,
              subcategory_id: event.subcategory_id || undefined
            }}
            studentId={studentId}
            onSuccess={handleParticipationSuccess}
            onCancel={() => setShowParticipationForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
})