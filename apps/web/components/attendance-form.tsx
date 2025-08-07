'use client'

import { useState } from 'react'
import { Button } from '@acu-apex/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@acu-apex/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Textarea } from '@acu-apex/ui'
import { AlertCircle, Clock } from 'lucide-react'
import { AttendanceSubmissionSchema, type AttendanceSubmission } from '@acu-apex/types'
import { submitAttendanceAction } from '@/lib/user-actions'

interface AttendanceFormProps {
  event: {
    id: string
    name: string
    due_date: string | null
  }
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AttendanceForm({ event, studentId, onSuccess, onCancel }: AttendanceFormProps) {
  const [formData, setFormData] = useState<Partial<AttendanceSubmission>>({
    submission_type: 'attendance',
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
      // Validate form data
      const validatedData = AttendanceSubmissionSchema.parse(formData)
      
      // Submit attendance
      const result = await submitAttendanceAction(event.id, studentId, validatedData)
      
      if (result.success) {
        onSuccess()
      } else {
        setErrors({ general: result.error || 'Failed to submit attendance' })
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.message.includes('Required')) {
          setErrors({ status: 'Please select your attendance status' })
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Record Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatEventDate(event.due_date)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Attendance Status *</Label>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'present' | 'absent' | 'excused' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your attendance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.status}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Note: If you were late, please mark yourself as absent.
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about your attendance"
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
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}