'use client'

import { useState, useEffect } from "react"
import { Button } from "@acu-apex/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { DialogHeader, DialogTitle } from "@acu-apex/ui"
import { Minus, Plus, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { submitParticipationScoresAction } from "@/lib/participation-actions"
import { toast } from "@acu-apex/ui"

interface CompanyParticipationFormProps {
  event: {
    id: string
    name: string
    description: string | null
    subcategory_id?: string | null
  }
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

interface CompanyMember {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    photo: string | null
  }
  student: {
    id: string
    company_id: string
  }
}

interface ParticipationScore {
  studentId: string
  score: number
}

export function CompanyParticipationForm({ event, studentId, onSuccess, onCancel }: CompanyParticipationFormProps) {
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCompanyMembers()
  }, [studentId])

  const loadCompanyMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      
      // First, get the user's company_id from the students table
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('company_id')
        .eq('id', studentId)
        .single()

      if (studentError) {
        throw new Error(`Failed to fetch student data: ${studentError.message}`)
      }

      if (!student?.company_id) {
        throw new Error('User is not assigned to a company')
      }

      // Fetch company members with their user data
      const { data: members, error: membersError } = await supabase
        .from('students')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email,
            photo,
            role
          )
        `)
        .eq('company_id', student.company_id)

      if (membersError) {
        throw new Error(`Failed to fetch company members: ${membersError.message}`)
      }

      // Transform the data
      const companyMembers: CompanyMember[] = (members || []).map(member => {
        // Handle the case where users might be an array or single object
        const userData = Array.isArray(member.users) ? member.users[0] : member.users
        
        if (!userData) {
          console.warn('No user data for member:', member.id)
          return null
        }
        
        return {
          user: userData,
          student: {
            id: member.id,
            company_id: member.company_id,
            academic_role: member.academic_role,
            company_role: member.company_role,
            academic_year_start: member.academic_year_start,
            academic_year_end: member.academic_year_end,
            created_at: member.created_at,
            updated_at: member.updated_at,
            student_id: member.student_id
          }
        }
      }).filter(Boolean) as CompanyMember[]
      
      setCompanyMembers(companyMembers)
      
      // Initialize scores to 3 for all members
      const initialScores: Record<string, number> = {}
      companyMembers.forEach(member => {
        initialScores[member.student.id] = 3
      })
      setScores(initialScores)
      
    } catch (err) {
      console.error('Error loading company members:', err)
      setError(err instanceof Error ? err.message : 'Failed to load company members')
    } finally {
      setLoading(false)
    }
  }

  const updateScore = (memberId: string, newScore: number) => {
    // Ensure score is within bounds (0-5)
    const boundedScore = Math.max(0, Math.min(5, newScore))
    setScores(prev => ({
      ...prev,
      [memberId]: boundedScore
    }))
  }

  const incrementScore = (memberId: string) => {
    updateScore(memberId, (scores[memberId] || 3) + 1)
  }

  const decrementScore = (memberId: string) => {
    updateScore(memberId, (scores[memberId] || 3) - 1)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Convert scores to submission format
      const participationScores: ParticipationScore[] = Object.entries(scores).map(([studentId, score]) => ({
        studentId,
        score
      }))

      const result = await submitParticipationScoresAction(event.id, participationScores)
      
      if (result.success) {
        toast({
          title: "Participation Scores Submitted",
          description: `Successfully submitted scores for ${participationScores.length} members.`,
        })
        onSuccess()
      } else {
        setError(result.error || 'Failed to submit scores')
      }
    } catch (err) {
      console.error('Error submitting participation scores:', err)
      setError('Failed to submit scores')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || '??'
  }

  const getEventTypeLabel = () => {
    if (event.subcategory_id === '0ceea111-1485-4a80-98a9-d82f3c12321c') {
      return 'GBE Team Participation'
    }
    if (event.subcategory_id === '78606cf2-7866-4ed5-8384-1e464a0b5d66') {
      return 'Company Team Building'
    }
    return 'Team Participation'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Loading Company Members...
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Error Loading Company Members
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader className="flex-shrink-0 pb-2">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Score {getEventTypeLabel()}
        </DialogTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">{event.name}</p>
          {event.description && <p className="text-xs">{event.description}</p>}
          <p className="text-xs bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-blue-800 dark:text-blue-200">
            💡 Rate each member's participation (0-5 points, default is 3)
          </p>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {companyMembers.map((member) => (
          <div key={member.student.id} className="bg-card border rounded-lg p-3">
            <div className="flex items-center gap-3">
              {/* Avatar and Name */}
              <div className="flex items-center flex-1 min-w-0">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage 
                    src={member.user.photo || undefined} 
                    alt={`${member.user.first_name} ${member.user.last_name}`} 
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(member.user.first_name, member.user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {member.user.first_name} {member.user.last_name}
                  </p>
                </div>
              </div>

              {/* Score Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => decrementScore(member.student.id)}
                  disabled={scores[member.student.id] <= 0}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-4 w-4 text-gray-700" />
                </button>
                
                <div className="w-10 text-center">
                  <span className="text-lg font-semibold text-primary">
                    {scores[member.student.id] || 3}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => incrementScore(member.student.id)}
                  disabled={scores[member.student.id] >= 5}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-destructive text-center py-2">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t flex-shrink-0">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || companyMembers.length === 0}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : `Submit (${companyMembers.length})`}
        </Button>
      </div>
    </div>
  )
}
