'use client'

import { useState } from 'react'
import { Button } from '@acu-apex/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@acu-apex/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Textarea } from '@acu-apex/ui'
import { AlertCircle, Users } from 'lucide-react'
import { 
  SmallGroupMonthlyCheckSubmissionSchema, 
  DreamTeamMonthlyCheckSubmissionSchema,
  type SmallGroupMonthlyCheckSubmission,
  type DreamTeamMonthlyCheckSubmission
} from '@acu-apex/types'
import { submitMonthlyCheckinAction } from '@/lib/user-actions'

interface MonthlyCheckinFormProps {
  event: {
    id: string
    name: string
    due_date: string | null
    subcategory_id?: string
  }
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

export function MonthlyCheckinForm({ event, studentId, onSuccess, onCancel }: MonthlyCheckinFormProps) {
  // Determine the submission type based on subcategory_id
  const isSmallGroup = event.subcategory_id === 'a32c3898-dbf1-4a92-a5db-811dfb6fcd0f'
  const isDreamTeam = event.subcategory_id === 'e0bd5604-0692-42fe-8b4b-7ea2d339abc7'
  
  if (!event.subcategory_id || (!isSmallGroup && !isDreamTeam)) {
    console.error('Invalid subcategory for weekly check-in:', event.subcategory_id)
  }
  
  const submissionType = isSmallGroup ? 'small_group' : isDreamTeam ? 'dream_team' : 'small_group'
  
  const [formData, setFormData] = useState<Partial<SmallGroupMonthlyCheckSubmission | DreamTeamMonthlyCheckSubmission>>({
    submission_type: submissionType,
    status: undefined,
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return 'No date specified'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago'
    }).format(date)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      // Validate form data based on submission type
      let validatedData
      if (isSmallGroup) {
        validatedData = SmallGroupMonthlyCheckSubmissionSchema.parse(formData)
      } else if (isDreamTeam) {
        validatedData = DreamTeamMonthlyCheckSubmissionSchema.parse(formData)
      } else {
        throw new Error('Invalid subcategory for weekly check-in')
      }
      
      // Submit monthly check-in
      const result = await submitMonthlyCheckinAction(event.id, studentId, validatedData)
      
      if (result.success) {
        onSuccess()
      } else {
        setErrors({ general: result.error || 'Failed to submit weekly check-in' })
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.message.includes('Required')) {
          setErrors({ status: 'Please select your involvement status' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    if (isSmallGroup) return 'Small Group Involvement Check-In'
    if (isDreamTeam) return 'Dream Team Involvement Check-In'
    return 'Weekly Check-In'
  }

  const getDescription = () => {
    if (isSmallGroup) return 'Please report your involvement status for Small Group activities this week.'
    if (isDreamTeam) return 'Please report your involvement status for Dream Team activities this week.'
    return 'Please report your involvement status for this week.'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <p className="text-sm text-muted-foreground">
            {getDescription()}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {formatEventDate(event.due_date)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Involvement Status *</Label>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'involved' | 'not_involved' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your involvement status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="involved">Involved</SelectItem>
                <SelectItem value="not_involved">Not Involved</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.status}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Select &quot;Involved&quot; if you participated in {isSmallGroup ? 'Small Group' : isDreamTeam ? 'Dream Team' : 'group'} activities this week.
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder={`Any additional notes about your ${isSmallGroup ? 'Small Group' : isDreamTeam ? 'Dream Team' : 'group'} involvement this week`}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !formData.status}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
