'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Button } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Textarea } from "@acu-apex/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@acu-apex/ui"
import { Label } from "@acu-apex/ui"
import { Calendar, Clock, Users, Camera } from "lucide-react"
import type { TeamParticipationSubmission } from "@acu-apex/types"

interface TeamParticipationFormProps {
  onSubmit: (data: TeamParticipationSubmission) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const TEAM_OPTIONS = [
  { 
    value: 'fellow_friday_team' as const, 
    label: 'Fellow Friday Team',
    description: 'Cross-company team focused on fellowship and Friday activities'
  },
  { 
    value: 'chapel_team' as const, 
    label: 'Chapel Team',
    description: 'Cross-company team supporting chapel services and spiritual activities'
  }
]

export function TeamParticipationForm({ onSubmit, onCancel, isSubmitting = false }: TeamParticipationFormProps) {
  const [formData, setFormData] = useState<Partial<TeamParticipationSubmission>>({
    submission_type: 'team_participation',
    team_type: undefined,
    date_of_participation: '',
    photos: [],
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.team_type) {
      newErrors.team_type = 'Please select a team'
    }



    if (!formData.date_of_participation) {
      newErrors.date_of_participation = 'Please select the date of participation'
    } else {
      // Validate date format and ensure it's not in the future
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.date_of_participation)) {
        newErrors.date_of_participation = 'Invalid date format'
      } else {
        const selectedDate = new Date(formData.date_of_participation)
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of today
        if (selectedDate > today) {
          newErrors.date_of_participation = 'Date cannot be in the future'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData as TeamParticipationSubmission)
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to submit team participation'
      })
    }
  }

  const handleInputChange = (field: keyof TeamParticipationSubmission, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedTeam = TEAM_OPTIONS.find(team => team.value === formData.team_type)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Participation</span>
          </CardTitle>
          <CardDescription>
            Report your participation in cross-company teams. Your submission will be reviewed by staff for point assignment (0-5 points).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team_type">Team *</Label>
            <Select 
              value={formData.team_type || ''} 
              onValueChange={(value) => handleInputChange('team_type', value as 'fellow_friday_team' | 'chapel_team')}
            >
              <SelectTrigger className={errors.team_type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_OPTIONS.map(team => (
                  <SelectItem key={team.value} value={team.value}>
                    <div className="space-y-1">
                      <div className="font-medium">{team.label}</div>
                      <div className="text-sm text-muted-foreground whitespace-normal leading-tight max-w-[300px]">
                        {team.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_type && (
              <p className="text-sm text-destructive">{errors.team_type}</p>
            )}
          </div>

          {/* Selected Team Info */}
          {selectedTeam && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium">{selectedTeam.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedTeam.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Date of Participation */}
          <div className="space-y-2">
            <Label htmlFor="date_of_participation">Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date_of_participation"
                type="date"
                value={formData.date_of_participation}
                onChange={(e) => handleInputChange('date_of_participation', e.target.value)}
                className={`pl-10 ${errors.date_of_participation ? 'border-destructive' : ''}`}
                max={new Date().toISOString().split('T')[0]} // Today's date as max
              />
            </div>
            {errors.date_of_participation && (
              <p className="text-sm text-destructive">{errors.date_of_participation}</p>
            )}
          </div>



          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your participation..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="min-h-[80px]"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes?.length || 0}/300 characters
            </p>
          </div>

          {/* Submission Error */}
          {errors.submit && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Team participation submissions will be reviewed by staff and assigned points (0-5) based on your level of involvement and contribution to the team.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}
