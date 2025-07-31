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
import { Calendar, CalendarDays, Clock, Users, AlertCircle, CheckCircle2, X } from 'lucide-react'
import type { RecurringEvent, EventInstance, Company } from '@acu-apex/types'
import { createRecurringEvent, createEventInstance, updateRecurringEvent, updateEventInstance } from '@/lib/staff-events'
import { formatPhoneNumber } from '@acu-apex/utils'

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
  event_type: 'self_report' | 'officer_input' | 'staff_input' | 'attendance'
  required_roles: string[]
  required_years: number[]
  class_code: string
  required_company: string
  is_active: boolean
  
  // Recurring event specific
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'semester' | 'yearly' | null
  recurrence_interval: number
  recurrence_days: number[]
  start_date: string
  end_date: string
  time_due: string
  
  // Event instance specific
  due_date: string
  recurring_event_id: string
}

const EVENT_TYPES = [
  { value: 'self_report', label: 'Self Report', description: 'Students report their own data' },
  { value: 'officer_input', label: 'Officer Input', description: 'Company officers input data for students' },
  { value: 'staff_input', label: 'Staff Input', description: 'Staff members input data for students' },
  { value: 'attendance', label: 'Attendance', description: 'Attendance tracking for classes or events' }
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
  { value: 'monthly', label: 'Monthly' },
  { value: 'semester', label: 'Semester' },
  { value: 'yearly', label: 'Yearly' }
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
    event_type: 'self_report',
    required_roles: [],
    required_years: [],
    class_code: '',
    required_company: '',
    is_active: true,
    recurrence_pattern: null,
    recurrence_interval: 1,
    recurrence_days: [],
    start_date: '',
    end_date: '',
    time_due: '',
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
          recurrence_pattern: data.recurrence_pattern,
          recurrence_interval: data.recurrence_interval || 1,
          recurrence_days: data.recurrence_days || [],
          start_date: data.start_date.split('T')[0], // Extract date part
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          time_due: data.time_due || '',
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
          recurrence_pattern: null,
          recurrence_interval: 1,
          recurrence_days: [],
          start_date: '',
          end_date: '',
          time_due: ''
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
      if (formData.recurrence_pattern && !formData.recurrence_interval) {
        newErrors.recurrence_interval = 'Recurrence interval is required'
      }
      if (formData.recurrence_pattern === 'weekly' && formData.recurrence_days.length === 0) {
        newErrors.recurrence_days = 'Select at least one day for weekly recurrence'
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
        const recurringData: Omit<RecurringEvent, 'id' | 'created_at'> = {
          name: formData.name,
          description: formData.description || null,
          event_type: formData.event_type,
          required_roles: formData.required_roles.length > 0 ? formData.required_roles : null,
          required_years: formData.required_years.length > 0 ? formData.required_years : null,
          class_code: formData.class_code || null,
          recurrence_pattern: formData.recurrence_pattern,
          recurrence_interval: formData.recurrence_interval || null,
          recurrence_days: formData.recurrence_days.length > 0 ? formData.recurrence_days : null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          time_due: formData.time_due || null,
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

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        {eventType === 'recurring' ? (
          <Calendar className="h-5 w-5 text-primary" />
        ) : (
          <CalendarDays className="h-5 w-5 text-secondary" />
        )}
        <h3 className="text-lg font-semibold">
          {mode === 'create' ? 'Create' : 'Edit'} {eventType === 'recurring' ? 'Recurring Event' : 'Event Instance'}
        </h3>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Select value={formData.event_type} onValueChange={(value: any) => 
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
        <CardHeader>
          <CardTitle className="text-base">Target Audience</CardTitle>
          <CardDescription>
            Leave empty to target all users. Select specific roles, years, or companies to limit the audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Required Roles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ROLE_OPTIONS.map(role => (
                <Badge
                  key={role.value}
                  variant={formData.required_roles.includes(role.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
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
            <div className="flex flex-wrap gap-2 mt-2">
              {YEAR_OPTIONS.map(year => (
                <Badge
                  key={year.value}
                  variant={formData.required_years.includes(year.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
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
            <Select value={formData.required_company} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, required_company: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
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
        <CardHeader>
          <CardTitle className="text-base">
            {eventType === 'recurring' ? 'Recurrence Schedule' : 'Due Date'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventType === 'recurring' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                <Select value={formData.recurrence_pattern || ''} onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, recurrence_pattern: value || null }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="No recurrence (single event)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No recurrence (single event)</SelectItem>
                    {RECURRENCE_PATTERNS.map(pattern => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.recurrence_pattern && (
                <div>
                  <Label htmlFor="recurrence_interval">
                    Every {formData.recurrence_interval} {formData.recurrence_pattern}(s)
                  </Label>
                  <Input
                    id="recurrence_interval"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.recurrence_interval}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurrence_interval: parseInt(e.target.value) || 1 
                    }))}
                    className={errors.recurrence_interval ? 'border-destructive' : ''}
                  />
                  {errors.recurrence_interval && (
                    <p className="text-sm text-destructive mt-1">{errors.recurrence_interval}</p>
                  )}
                </div>
              )}

              {formData.recurrence_pattern === 'weekly' && (
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <Badge
                        key={day.value}
                        variant={formData.recurrence_days.includes(day.value) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.short}
                        {formData.recurrence_days.includes(day.value) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {errors.recurrence_days && (
                    <p className="text-sm text-destructive mt-1">{errors.recurrence_days}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="time_due">Time Due (Optional)</Label>
                <Input
                  id="time_due"
                  type="time"
                  value={formData.time_due}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_due: e.target.value }))}
                />
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

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
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