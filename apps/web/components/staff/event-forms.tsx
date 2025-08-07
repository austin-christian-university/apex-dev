'use client'

import { useState, useEffect } from 'react'
import { Button } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Textarea } from '@acu-apex/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acu-apex/ui'
import { Checkbox } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Calendar, CalendarDays, AlertCircle, CheckCircle2, X } from 'lucide-react'
import type { RecurringEvent, EventInstance, Company } from '@acu-apex/types'
import { createRecurringEvent, createEventInstance } from '@/lib/staff-events'

interface EventFormProps {
  mode: 'create' | 'edit'
  eventType: 'recurring' | 'instance'
  companies: Company[]
  initialData?: RecurringEvent | EventInstance
  onSuccess: () => void
  onCancel: () => void
  userId: string
}

type FormData = {
  name: string
  description: string
  event_type: 'self_report' | 'attendance'
  required_roles: string[]
  required_years: number[]
  class_code: string
  required_company: string
  is_active: boolean
  
  // Recurring event specific - now matches database JSONB format
  recurrence_type: 'daily' | 'weekly' | 'monthly' | null
  recurrence_day_of_week: number | null // 0-6 for weekly pattern
  recurrence_time: string // HH:MM format
  recurrence_timezone: string
  start_date: string
  end_date: string
  
  // Event instance specific
  due_date: string
  recurring_event_id: string
}

const EVENT_TYPES = [
  { value: 'attendance', label: 'Attendance', description: 'Attendance tracking for classes or events' },
  { value: 'self_report', label: 'Participation', description: 'Student participation in activities' }
]

const ROLE_OPTIONS = [
  { value: 'student', label: 'Students' },
  { value: 'officer', label: 'Officers' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admins' }
]

const YEAR_OPTIONS = [
  { value: 1, label: 'Freshmen (Year 1)' },
  { value: 2, label: 'Sophomores (Year 2)' },
  { value: 3, label: 'Juniors (Year 3)' },
  { value: 4, label: 'Seniors (Year 4)' },
  { value: 5, label: 'Graduate Students (Year 5+)' }
]

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
]

export function EventForm({ mode, eventType, companies, initialData, onSuccess, onCancel, userId }: EventFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    event_type: 'attendance',
    required_roles: [],
    required_years: [],
    class_code: '',
    required_company: '',
    is_active: true,
    recurrence_type: null,
    recurrence_day_of_week: null,
    recurrence_time: '09:00',
    recurrence_timezone: 'America/Chicago',
    start_date: '',
    end_date: '',
    due_date: '',
    recurring_event_id: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data if editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      if (eventType === 'recurring') {
        const data = initialData as RecurringEvent
        setFormData({
          name: data.name,
          description: data.description || '',
          event_type: data.event_type,
          required_roles: data.required_roles || [],
          required_years: data.required_years || [],
          class_code: data.class_code || '',
          required_company: data.required_company || '',
          is_active: data.is_active,
          recurrence_type: data.recurrence_pattern?.type || null,
          recurrence_day_of_week: data.recurrence_pattern?.day_of_week || null,
          recurrence_time: data.recurrence_pattern?.time || '09:00',
          recurrence_timezone: data.recurrence_pattern?.timezone || 'America/Chicago',
          start_date: data.start_date.split('T')[0], // Extract date part
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          due_date: '',
          recurring_event_id: ''
        })
      } else {
        const data = initialData as EventInstance
        setFormData({
          name: data.name,
          description: data.description || '',
          event_type: data.event_type,
          required_roles: data.required_roles || [],
          required_years: data.required_years || [],
          class_code: data.class_code || '',
          required_company: data.required_company || '',
          is_active: data.is_active,
          due_date: data.due_date ? data.due_date.split('T')[0] : '',
          recurring_event_id: data.recurring_event_id || '',
          recurrence_type: null,
          recurrence_day_of_week: null,
          recurrence_time: '09:00',
          recurrence_timezone: 'America/Chicago',
          start_date: '',
          end_date: ''
        })
      }
    }
  }, [mode, eventType, initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required'
    }

    if (!formData.event_type) {
      newErrors.event_type = 'Event type is required'
    }

    if (eventType === 'recurring') {
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required'
      }
      if (formData.recurrence_type === 'weekly' && formData.recurrence_day_of_week === null) {
        newErrors.recurrence_day_of_week = 'Select a day of week for weekly recurrence'
      }
      if (!formData.recurrence_time) {
        newErrors.recurrence_time = 'Event time is required'
      }
    } else {
      if (!formData.due_date) {
        newErrors.due_date = 'Due date is required'
      }
    }

    if (formData.event_type === 'attendance' && !formData.class_code.trim()) {
      newErrors.class_code = 'Class code is required for attendance events'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      if (eventType === 'recurring') {
        // Create the JSONB recurrence pattern object
        const recurrencePattern: RecurringEvent['recurrence_pattern'] = {
          type: formData.recurrence_type,
          time: formData.recurrence_time,
          timezone: formData.recurrence_timezone
        }

        // Add day_of_week for weekly patterns
        if (formData.recurrence_type === 'weekly' && formData.recurrence_day_of_week !== null) {
          recurrencePattern.day_of_week = formData.recurrence_day_of_week
        }

        const recurringData: Omit<RecurringEvent, 'id' | 'created_at'> = {
          name: formData.name,
          description: formData.description || null,
          event_type: formData.event_type,
          required_roles: formData.required_roles.length > 0 ? formData.required_roles : null,
          required_years: formData.required_years.length > 0 ? formData.required_years : null,
          class_code: formData.class_code || null,
          recurrence_pattern: recurrencePattern,
          recurrence_interval: null, // Not used in new structure
          recurrence_days: null, // Not used in new structure  
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          time_due: null, // Time is now in recurrence_pattern
          is_active: formData.is_active,
          created_by: userId,
          required_company: formData.required_company || null
        }

        if (mode === 'create') {
          const result = await createRecurringEvent(recurringData, userId)
          if (result.success) {
            onSuccess()
          } else {
            setErrors({ submit: result.error || 'Failed to create recurring event' })
          }
        } else {
          // TODO: Implement update logic
        }
      } else {
        const instanceData: Omit<EventInstance, 'id' | 'created_at'> = {
          name: formData.name,
          description: formData.description || null,
          event_type: formData.event_type,
          required_roles: formData.required_roles.length > 0 ? formData.required_roles : null,
          required_years: formData.required_years.length > 0 ? formData.required_years : null,
          class_code: formData.class_code || null,
          due_date: formData.due_date || null,
          is_active: formData.is_active,
          created_by: userId,
          recurring_event_id: formData.recurring_event_id || null,
          required_company: formData.required_company || null
        }

        if (mode === 'create') {
          const result = await createEventInstance(instanceData, userId)
          if (result.success) {
            onSuccess()
          } else {
            setErrors({ submit: result.error || 'Failed to create event instance' })
          }
        } else {
          // TODO: Implement update logic
        }
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.includes(role)
        ? prev.required_roles.filter(r => r !== role)
        : [...prev.required_roles, role]
    }))
  }

  const toggleYear = (year: number) => {
    setFormData(prev => ({
      ...prev,
      required_years: prev.required_years.includes(year)
        ? prev.required_years.filter(y => y !== year)
        : [...prev.required_years, year]
    }))
  }

  const handleDaySelect = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence_day_of_week: day
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Header - More compact */}
      <div className="flex items-center space-x-2 mb-4">
        {eventType === 'recurring' ? (
          <Calendar className="h-4 w-4 text-primary" />
        ) : (
          <CalendarDays className="h-4 w-4 text-secondary" />
        )}
        <h3 className="text-base font-semibold">
          {mode === 'create' ? 'Create' : 'Edit'} {eventType === 'recurring' ? 'Recurring Event' : 'Event Instance'}
        </h3>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter event name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this event is for..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="event_type">Event Type *</Label>
            <Select value={formData.event_type} onValueChange={(value: RecurringEvent['event_type']) => 
              setFormData(prev => ({ ...prev, event_type: value }))
            }>
              <SelectTrigger className={errors.event_type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.event_type && (
              <p className="text-sm text-destructive mt-1">{errors.event_type}</p>
            )}
          </div>

          {formData.event_type === 'attendance' && (
            <div>
              <Label htmlFor="class_code">Class Code *</Label>
              <Input
                id="class_code"
                value={formData.class_code}
                onChange={(e) => setFormData(prev => ({ ...prev, class_code: e.target.value }))}
                placeholder="e.g., MATH101, HIST205"
                className={errors.class_code ? 'border-destructive' : ''}
              />
              {errors.class_code && (
                <p className="text-sm text-destructive mt-1">{errors.class_code}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
            />
            <Label htmlFor="is_active">Event is active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
          <CardDescription className="text-xs">
            Leave empty to target all users. Select specific roles, years, or companies to limit the audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div>
            <Label>Required Roles</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ROLE_OPTIONS.map(role => (
                <Badge
                  key={role.value}
                  variant={formData.required_roles.includes(role.value) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs py-1 px-2"
                  onClick={() => toggleRole(role.value)}
                >
                  {role.label}
                  {formData.required_roles.includes(role.value) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Required Academic Years</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {YEAR_OPTIONS.map(year => (
                <Badge
                  key={year.value}
                  variant={formData.required_years.includes(year.value) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs py-1 px-2"
                  onClick={() => toggleYear(year.value)}
                >
                  {year.label}
                  {formData.required_years.includes(year.value) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="required_company">Required Company</Label>
            <Select value={formData.required_company || "all"} onValueChange={(value: string) => 
              setFormData(prev => ({ ...prev, required_company: value === "all" ? "" : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date/Time Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {eventType === 'recurring' ? 'Recurrence Schedule' : 'Due Date'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {eventType === 'recurring' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className={errors.start_date ? 'border-destructive' : ''}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive mt-1">{errors.start_date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recurrence_type">Recurrence Pattern</Label>
                <Select value={formData.recurrence_type || 'none'} onValueChange={(value: string) => 
                  setFormData(prev => ({ ...prev, recurrence_type: value === 'none' ? null : value as 'daily' | 'weekly' | 'monthly' }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="No recurrence (single event)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No recurrence (single event)</SelectItem>
                    {RECURRENCE_PATTERNS.map(pattern => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.recurrence_type === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <Badge
                        key={day.value}
                        variant={formData.recurrence_day_of_week === day.value ? 'default' : 'outline'}
                        className="cursor-pointer text-xs py-1 px-2"
                        onClick={() => handleDaySelect(day.value)}
                      >
                        {day.short}
                        {formData.recurrence_day_of_week === day.value && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {errors.recurrence_day_of_week && (
                    <p className="text-sm text-destructive mt-1">{errors.recurrence_day_of_week}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="recurrence_time">Event Time *</Label>
                <Input
                  id="recurrence_time"
                  type="time"
                  value={formData.recurrence_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence_time: e.target.value }))}
                  className={errors.recurrence_time ? 'border-destructive' : ''}
                />
                {errors.recurrence_time && (
                  <p className="text-sm text-destructive mt-1">{errors.recurrence_time}</p>
                )}
              </div>

              <div>
                <Label htmlFor="recurrence_timezone">Timezone</Label>
                <Select value={formData.recurrence_timezone} onValueChange={(value: string) => 
                  setFormData(prev => ({ ...prev, recurrence_timezone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Chicago">Central Time (America/Chicago)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (America/New_York)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (America/Denver)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={errors.due_date ? 'border-destructive' : ''}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive mt-1">{errors.due_date}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Errors */}
      {errors.submit && (
        <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Actions - Mobile-friendly */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t bg-background sticky bottom-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="order-1 sm:order-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Event' : 'Update Event'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}