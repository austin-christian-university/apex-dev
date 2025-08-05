# Event Submission Usage Examples

This document shows how to use the shared types and Zod validation across your frontend and backend.

## **Frontend Usage**

### **1. Form Components with Type Safety**

```typescript
// components/forms/CommunityServiceForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  CommunityServiceSubmission, 
  CommunityServiceSubmissionSchema,
  validateSubmissionData 
} from '@acu-apex/types'

interface CommunityServiceFormProps {
  eventId: string
  studentId: string
  onSubmit: (data: CommunityServiceSubmission) => Promise<void>
}

export function CommunityServiceForm({ eventId, studentId, onSubmit }: CommunityServiceFormProps) {
  const [formData, setFormData] = useState<Partial<CommunityServiceSubmission>>({
    submission_type: 'community_service',
    hours: 0,
    organization: '',
    supervisor_name: '',
    supervisor_contact: '',
    description: '',
    location: '',
    date_of_service: new Date().toISOString().split('T')[0],
    verification_method: 'photo'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate the data using Zod
      const validatedData = validateSubmissionData(formData)
      
      // Submit to API
      await onSubmit(validatedData)
      
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.message.includes('Required')) {
          setErrors({ general: 'Please fill in all required fields' })
        } else {
          setErrors({ general: error.message })
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Hours</label>
        <Input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={formData.hours || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            hours: parseFloat(e.target.value) || 0 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Organization</label>
        <Input
          value={formData.organization || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            organization: e.target.value 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Supervisor Name</label>
        <Input
          value={formData.supervisor_name || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            supervisor_name: e.target.value 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Supervisor Contact</label>
        <Input
          type="email"
          value={formData.supervisor_contact || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            supervisor_contact: e.target.value 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            description: e.target.value 
          }))}
          placeholder="Describe the community service work performed..."
          required
          minLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input
          value={formData.location || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            location: e.target.value 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date of Service</label>
        <Input
          type="date"
          value={formData.date_of_service || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            date_of_service: e.target.value 
          }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Verification Method</label>
        <select
          value={formData.verification_method || 'photo'}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            verification_method: e.target.value as any 
          }))}
          className="w-full p-2 border rounded"
          required
        >
          <option value="photo">Photo</option>
          <option value="supervisor_signature">Supervisor Signature</option>
          <option value="organization_letter">Organization Letter</option>
        </select>
      </div>

      {errors.general && (
        <div className="text-red-500 text-sm">{errors.general}</div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Community Service'}
      </Button>
    </form>
  )
}
```

### **2. Dynamic Form Component**

```typescript
// components/forms/DynamicSubmissionForm.tsx
'use client'

import { useState } from 'react'
import { 
  EventSubmissionData,
  getSubmissionSchema,
  validateSubmissionData,
  isValidSubmissionData
} from '@acu-apex/types'

interface DynamicSubmissionFormProps {
  eventType: string
  submissionType: string
  onSubmit: (data: EventSubmissionData) => Promise<void>
}

export function DynamicSubmissionForm({ 
  eventType, 
  submissionType, 
  onSubmit 
}: DynamicSubmissionFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    submission_type: submissionType
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate using the appropriate schema
      const validatedData = validateSubmissionData(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message })
      }
    }
  }

  // Render different form fields based on submission type
  const renderFormFields = () => {
    switch (submissionType) {
      case 'community_service':
        return (
          <>
            <input
              type="number"
              placeholder="Hours"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                hours: parseFloat(e.target.value) 
              }))}
            />
            <input
              type="text"
              placeholder="Organization"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                organization: e.target.value 
              }))}
            />
            {/* Add more fields... */}
          </>
        )
      
      case 'attendance':
        return (
          <>
            <select
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value 
              }))}
            >
              <option value="">Select Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
            {/* Add more fields... */}
          </>
        )
      
      default:
        return <div>Unknown submission type: {submissionType}</div>
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {renderFormFields()}
      {errors.general && <div className="error">{errors.general}</div>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## **Backend Usage**

### **1. API Route with Validation**

```typescript
// app/api/event-submissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  EventSubmissionData,
  validateSubmissionData,
  safeValidateSubmissionData,
  isValidSubmissionData
} from '@acu-apex/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the submission data using Zod
    let validatedData: EventSubmissionData
    try {
      validatedData = validateSubmissionData(body.submission_data)
    } catch (validationError) {
      return NextResponse.json({ 
        error: 'Invalid submission data', 
        details: validationError instanceof Error ? validationError.message : 'Unknown error'
      }, { status: 400 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: body.event_id,
        student_id: body.student_id,
        submitted_by: user.id,
        submission_data: validatedData // This is now type-safe
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      submission: data 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const studentId = searchParams.get('student_id')

    let query = supabase
      .from('event_submissions')
      .select(`
        *,
        event_instances(name, event_type),
        students(id, users(first_name, last_name))
      `)

    if (eventId) query = query.eq('event_id', eventId)
    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
    }

    // Validate each submission's data
    const validatedSubmissions = data?.map(submission => {
      const isValid = isValidSubmissionData(submission.submission_data)
      return {
        ...submission,
        submission_data_valid: isValid,
        // If invalid, you might want to log this or handle it differently
        submission_data: isValid ? submission.submission_data : null
      }
    })

    return NextResponse.json({ 
      submissions: validatedSubmissions 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### **2. Server Action with Validation**

```typescript
// lib/actions/event-submissions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  EventSubmissionData,
  validateSubmissionData,
  getSubmissionSchema
} from '@acu-apex/types'

export async function submitEventSubmission(
  eventId: string,
  studentId: string,
  submissionData: unknown
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Validate the submission data
    const validatedData = validateSubmissionData(submissionData)

    // Additional business logic validation
    if (validatedData.submission_type === 'community_service') {
      if (validatedData.hours > 24) {
        throw new Error('Community service hours cannot exceed 24 hours per day')
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('event_submissions')
      .insert({
        event_id: eventId,
        student_id: studentId,
        submitted_by: user.id,
        submission_data: validatedData
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save submission')
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath(`/students/${studentId}`)

    return { success: true, submission: data }

  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

// Note: The approval system has been removed. Submissions are now automatically accepted.
// If you need approval functionality, consider implementing it through a separate workflow
// or status field in the submission_data JSONB column.
```

## **3. Database Functions with Validation**

```sql
-- Create a function to validate submission data at the database level
CREATE OR REPLACE FUNCTION validate_submission_jsonb(
  submission_data jsonb,
  event_type text
) RETURNS boolean AS $$
BEGIN
  -- Basic validation that can be done at the database level
  IF submission_data IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if submission_type exists
  IF submission_data->>'submission_type' IS NULL THEN
    RETURN false;
  END IF;
  
  -- Validate based on event type
  CASE event_type
    WHEN 'attendance' THEN
      RETURN (
        submission_data->>'status' IN ('present', 'late', 'absent', 'excused') AND
        submission_data->>'participation_level' IN ('active', 'passive', 'disruptive')
      );
    
    WHEN 'self_report' THEN
      -- Community service validation
      IF submission_data->>'submission_type' = 'community_service' THEN
        RETURN (
          (submission_data->>'hours')::numeric >= 0 AND
          (submission_data->>'hours')::numeric <= 24 AND
          submission_data->>'organization' IS NOT NULL AND
          submission_data->>'description' IS NOT NULL
        );
      END IF;
      
      RETURN true;
    
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to the event_submissions table
ALTER TABLE event_submissions 
ADD CONSTRAINT check_submission_data_valid 
CHECK (
  validate_submission_jsonb(
    submission_data, 
    (SELECT event_type FROM event_instances WHERE id = event_id)
  )
);
```

## **4. Type-Safe Query Functions**

```typescript
// lib/queries/event-submissions.ts
import { createClient } from '@/lib/supabase/client'
import { 
  EventSubmissionData,
  CommunityServiceSubmission,
  AttendanceSubmission,
  isValidSubmissionData
} from '@acu-apex/types'

export async function getCommunityServiceSubmissions(studentId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_submissions')
    .select(`
      *,
      event_instances(name, event_type)
    `)
    .eq('student_id', studentId)
    .contains('submission_data', { submission_type: 'community_service' })

  if (error) throw error

  // Type-safe filtering and validation
  const validSubmissions = data?.filter(submission => {
    return isValidSubmissionData(submission.submission_data) &&
           submission.submission_data.submission_type === 'community_service'
  }) as (typeof data[0] & { submission_data: CommunityServiceSubmission })[] | null

  return validSubmissions || []
}

export async function getAttendanceRecords(studentId: string, dateRange?: { start: string, end: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('event_submissions')
    .select(`
      *,
      event_instances(name, event_type, due_date)
    `)
    .eq('student_id', studentId)
    .contains('submission_data', { submission_type: 'attendance' })

  if (dateRange) {
    query = query
      .gte('submitted_at', dateRange.start)
      .lte('submitted_at', dateRange.end)
  }

  const { data, error } = await query

  if (error) throw error

  // Type-safe filtering
  const validSubmissions = data?.filter(submission => {
    return isValidSubmissionData(submission.submission_data) &&
           submission.submission_data.submission_type === 'attendance'
  }) as (typeof data[0] & { submission_data: AttendanceSubmission })[] | null

  return validSubmissions || []
}
```

## **Key Benefits of This Approach**

1. **Type Safety**: TypeScript ensures you can't pass invalid data structures
2. **Runtime Validation**: Zod catches invalid data at runtime
3. **Shared Logic**: Same validation rules on frontend and backend
4. **Database Constraints**: Additional validation at the database level
5. **Easy Testing**: You can test validation logic independently
6. **IntelliSense**: Full autocomplete and error checking in your IDE
7. **Refactoring Safety**: TypeScript will catch breaking changes

## **Best Practices**

1. **Always validate on both frontend and backend**
2. **Use the shared types package for consistency**
3. **Add database-level constraints for critical validation**
4. **Handle validation errors gracefully with user-friendly messages**
5. **Log validation failures for debugging**
6. **Test validation logic thoroughly**
7. **Keep schemas in sync when adding new submission types** 