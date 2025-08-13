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
  subcategory_id: string

  class_code: string
  required_company: string
  is_active: boolean
  
  // Recurring event specific - now matches database JSONB format
  recurrence_type: 'weekly' // Only weekly is currently supported
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
  { value: 'officer', label: 'Officers' }
]

// Subcategory mappings based on event type
const ATTENDANCE_SUBCATEGORIES = [
  { id: '296e0201-be1f-4a9b-bebb-e4288046431d', name: 'GBE Attendance' },
  { id: 'c94c68d4-661c-4378-9c63-c505ee7ed4de', name: 'Chapel Attendance' },
  { id: '221c3ba8-42e5-4f4f-a553-ba3134b6d433', name: 'Fellow Friday Attendance' },
  { id: '1a83ee45-7869-4f24-a70f-12ff3e1bc243', name: 'Company Community Events' }
]

const PARTICIPATION_SUBCATEGORIES = [
  { id: 'df11fbad-26c8-452c-97ca-9d5009b1b591', name: 'Fellow Friday Team Participation' },
  { id: '78606cf2-7866-4ed5-8384-1e464a0b5d66', name: 'Company Team-Building' },
  { id: '865e0e15-c14d-4b23-abd2-5f1b6ccf5dbc', name: 'Chapel Team Participation' },
  { id: '0ceea111-1485-4a80-98a9-d82f3c12321c', name: 'GBE Participation' }
]

const ALL_SUBCATEGORIES = [
  { id: 'd1d972a4-2484-4b9a-a53c-0b63bb2e952c', name: 'Academic Class Attendance & Grades' },
  { id: 'c94c68d4-661c-4378-9c63-c505ee7ed4de', name: 'Chapel Attendance' },
  { id: '865e0e15-c14d-4b23-abd2-5f1b6ccf5dbc', name: 'Chapel Team Participation' },
  { id: 'bc062d8d-6e16-4f0a-84ca-5fd9d7c10f8c', name: 'Community Service Hours' },
  { id: '1a83ee45-7869-4f24-a70f-12ff3e1bc243', name: 'Company Community Events' },
  { id: '78606cf2-7866-4ed5-8384-1e464a0b5d66', name: 'Company Team-Building' },
  { id: 'efdbc642-a52d-4872-ada5-2687fc03be73', name: 'Credentials or Certifications' },
  { id: 'e0bd5604-0692-42fe-8b4b-7ea2d339abc7', name: 'Dream Team Involvement' },
  { id: '221c3ba8-42e5-4f4f-a553-ba3134b6d433', name: 'Fellow Friday Attendance' },
  { id: 'df11fbad-26c8-452c-97ca-9d5009b1b591', name: 'Fellow Friday Team Participation' },
  { id: '296e0201-be1f-4a9b-bebb-e4288046431d', name: 'GBE Attendance' },
  { id: '0ceea111-1485-4a80-98a9-d82f3c12321c', name: 'GBE Participation' },
  { id: 'a3bab151-0ce1-402f-b507-7d6c3489bc8c', name: 'Job or Campus Role Promotion/Resume-Building Opportunities' },
  { id: '49ccaacd-d437-4421-809a-f957c8b4baf8', name: 'Lions Games Involvement' },
  { id: 'f50830fe-b820-4223-89e2-e69241b459af', name: 'Practicum Grade' },
  { id: 'a32c3898-dbf1-4a92-a5db-811dfb6fcd0f', name: 'Small Group Involvement' },
  { id: '8d13f1b9-33e1-4a62-be45-488a6834112f', name: 'Spiritual Formation Grade' }
]



const RECURRENCE_PATTERNS = [
  { value: 'weekly', label: 'Weekly' }
  // Note: daily and monthly patterns are not yet implemented in database triggers
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
    subcategory_id: '',

    class_code: '',
    required_company: '',
    is_active: true,
    recurrence_type: 'weekly',
    recurrence_day_of_week: null,
    recurrence_time: '09:00',
    recurrence_timezone: 'America/Chicago',
    start_date: '',
    end_date: '',
    due_date: '',
    recurring_event_id: ''
  })
  
  const [showAllSubcategories, setShowAllSubcategories] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available subcategories based on event type and show all state
  const getAvailableSubcategories = () => {
    if (showAllSubcategories) {
      return ALL_SUBCATEGORIES
    }
    
    return formData.event_type === 'attendance' 
      ? ATTENDANCE_SUBCATEGORIES 
      : PARTICIPATION_SUBCATEGORIES
  }

  // Reset subcategory when event type changes (but only after initial load)
  useEffect(() => {
    if (formData.event_type && mode === 'create') {
      setFormData(prev => ({ ...prev, subcategory_id: '' }))
      setShowAllSubcategories(false)
    }
  }, [formData.event_type, mode])

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
          subcategory_id: data.subcategory_id || '',

          class_code: data.class_code || '',
          required_company: data.required_company || '',
          is_active: data.is_active,
          recurrence_type: 'weekly', // Always weekly
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
          event_type: data.event_type === 'dev_event' ? 'self_report' : data.event_type,
          required_roles: data.required_roles || [],
          subcategory_id: data.subcategory_id || '',

          class_code: data.class_code || '',
          required_company: data.required_company || '',
          is_active: data.is_active,
          due_date: data.due_date ? data.due_date.split('T')[0] : '',
          recurring_event_id: data.recurring_event_id || '',
          recurrence_type: 'weekly',
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

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Holistic GPA Subcategory is required'
    }

    if (eventType === 'recurring') {
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required'
      }
      if (!formData.end_date) {
        newErrors.end_date = 'End date is required'
      }
      if (formData.recurrence_day_of_week === null) {
        newErrors.recurrence_day_of_week = 'Select a day of week for the recurring event'
      }
      if (!formData.recurrence_time) {
        newErrors.recurrence_time = 'Event time is required'
      }
    } else {
      if (!formData.due_date) {
        newErrors.due_date = 'Due date is required'
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

    setLoading(true)
    
    try {
      if (eventType === 'recurring') {
        // Create the JSONB recurrence pattern object
        const recurrencePattern: RecurringEvent['recurrence_pattern'] = {
          type: formData.recurrence_type,
          time: formData.recurrence_time,
          timezone: formData.recurrence_timezone
        }

        // Add day_of_week (required for weekly patterns)
        if (formData.recurrence_day_of_week !== null) {
          recurrencePattern.day_of_week = formData.recurrence_day_of_week
        }

        const recurringData: Omit<RecurringEvent, 'id' | 'created_at'> = {
          name: formData.name,
          description: formData.description || null,
          event_type: formData.event_type,
          required_roles: formData.required_roles.length > 0 ? formData.required_roles : null,
          required_years: null, // No longer used
          class_code: formData.class_code || null,
          subcategory_id: formData.subcategory_id,
          recurrence_pattern: recurrencePattern,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          is_active: formData.is_active,
          show_on_homepage: true, // Staff-created events always show on homepage
          created_by: userId,
          required_company: formData.required_company || null,
          instances_generated: false // Will be set to true by the trigger
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
          required_years: null, // No longer used
          class_code: formData.class_code || null,
          subcategory_id: formData.subcategory_id,
          due_date: formData.due_date || null,
          is_active: formData.is_active,
          show_on_homepage: true,
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



          <div>
            <Label htmlFor="subcategory_id">Holistic GPA Subcategory *</Label>
            <Select value={formData.subcategory_id} onValueChange={(value: string) => {
              if (value === 'see_all') {
                setShowAllSubcategories(true)
                return
              }
              setFormData(prev => ({ ...prev, subcategory_id: value }))
            }}>
              <SelectTrigger className={errors.subcategory_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSubcategories().map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
                {!showAllSubcategories && (
                  <SelectItem value="see_all" className="text-primary font-medium">
                    See all subcategories...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.subcategory_id && (
              <p className="text-sm text-destructive mt-1">{errors.subcategory_id}</p>
            )}
            {showAllSubcategories && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing all subcategories. Change event type to see filtered options.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
          <CardDescription className="text-xs">
            Leave empty to target all users. Select specific roles or companies to limit the audience.
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
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className={errors.end_date ? 'border-destructive' : ''}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-destructive mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Day of Week *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select which day of the week this event should occur
                </p>
                <div className="flex flex-wrap gap-1.5">
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