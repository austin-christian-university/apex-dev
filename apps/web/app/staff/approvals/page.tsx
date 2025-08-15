'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Textarea } from '@acu-apex/ui'
import { Separator } from '@acu-apex/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@acu-apex/ui'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Building2, 
  Calendar, 
  Award,
  Briefcase,
  Heart,

  Mail,
  FileText,
  Star,

  ImageIcon,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react'

import { formatDate, formatShortDate } from '@acu-apex/utils'
import { getPendingSubmissionsAction, approveSubmissionAction, rejectSubmissionAction } from '@/lib/staff-actions'

interface SubmissionData {
  id: string
  submission_data: any
  submitted_at: string
  students: {
    id: string
    company_id: string
    academic_role: string
    company_role: string
    users: {
      id: string
      first_name: string | null
      last_name: string | null
      email: string | null
      photo: string | null
    } | null
    companies: {
      id: string
      name: string
    } | null
  } | null
  event_instances: {
    id: string
    name: string
    description: string
    event_type: string
  } | null
}

export default function StaffApprovalsPage() {

  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pointsToGrant, setPointsToGrant] = useState<number>(0)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

  // Load pending submissions
  useEffect(() => {
    loadPendingSubmissions()
  }, [])

  const loadPendingSubmissions = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true)
      else setLoading(true)
      
      const result = await getPendingSubmissionsAction()
      if (result.success) {
        setSubmissions(result.submissions as any)
      } else {
        console.error('Failed to load submissions:', result.error)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getEventTypeIcon = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return Heart
      case 'job_promotion': return Briefcase
      case 'credentials': return Award
      case 'team_participation': return User
      default: return Clock
    }
  }

  const getEventTypeColor = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
      case 'job_promotion': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
      case 'credentials': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
      case 'team_participation': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getEventTypeLabel = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return 'Community Service'
      case 'job_promotion': return 'Job Promotion'
      case 'credentials': return 'Credentials'
      case 'team_participation': return 'Team Participation'
      default: return submissionType
    }
  }

  const getSubmissionTypeRequirement = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return 'Review and approve (points auto-assigned)'
      case 'job_promotion': return 'Assign point value'
      case 'credentials': return 'Assign point value'
      case 'team_participation': return 'Assign participation rating (0-5 points)'
      default: return 'Review required'
    }
  }

  const handleViewSubmission = (submission: SubmissionData, action: 'approve' | 'reject' = 'approve') => {
    setSelectedSubmission(submission)
    setActionType(action)
    // Set default points based on submission type
    if (submission.submission_data.submission_type === 'community_service') {
      setPointsToGrant(1) // Auto-assigned based on hours
    } else if (submission.submission_data.submission_type === 'team_participation') {
      setPointsToGrant(3) // Default to middle rating
    } else {
      setPointsToGrant(0) // Other types start at 0
    }
    setApprovalNotes('')
    setRejectionReason('')
    setShowApprovalDialog(true)
  }

  const handleApproval = async () => {
    if (!selectedSubmission) return

    setIsProcessing(true)
    try {
      let result
      if (actionType === 'approve') {
        // For community service, use the hours as points (1 point per hour)
        const finalPoints = selectedSubmission.submission_data.submission_type === 'community_service' 
          ? selectedSubmission.submission_data.hours 
          : pointsToGrant
        result = await approveSubmissionAction(selectedSubmission.id, finalPoints, approvalNotes)
      } else {
        result = await rejectSubmissionAction(selectedSubmission.id, rejectionReason)
      }

      if (result.success) {
        setShowApprovalDialog(false)
        setSelectedSubmission(null)
        await loadPendingSubmissions() // Refresh the list
      } else {
        console.error('Action failed:', result.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Action error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderSubmissionDetails = (submissionData: any) => {
    const type = submissionData.submission_type

    if (type === 'community_service') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Hours Contributed
              </div>
              <p className="text-lg font-semibold">{submissionData.hours} hours</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Service Date
              </div>
              <p className="text-lg">{formatDate(submissionData.date_of_service)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                Organization
              </div>
              <p className="font-medium">{submissionData.organization}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Supervisor Contact
              </div>
              <div className="space-y-1">
                <p className="font-medium">{submissionData.supervisor_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${submissionData.supervisor_contact}`} className="hover:underline">
                    {submissionData.supervisor_contact}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm leading-relaxed">{submissionData.description}</p>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'job_promotion') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                New Position
              </div>
              <p className="text-lg font-semibold">{submissionData.promotion_title}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Promotion Date
              </div>
              <p className="text-lg">{formatDate(submissionData.date_of_promotion)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                Organization
              </div>
              <p className="font-medium">{submissionData.organization}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Supervisor Contact
              </div>
              <div className="space-y-1">
                <p className="font-medium">{submissionData.supervisor_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${submissionData.supervisor_contact}`} className="hover:underline">
                    {submissionData.supervisor_contact}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm leading-relaxed">{submissionData.description}</p>
            </div>
          </div>
        </div>
      )
    }

    if (type === 'credentials') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Award className="h-4 w-4" />
                Credential Name
              </div>
              <p className="text-lg font-semibold">{submissionData.credential_name}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date Earned
              </div>
              <p className="text-lg">{formatDate(submissionData.date_of_credential)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                Granting Organization
              </div>
              <p className="font-medium">{submissionData.granting_organization}</p>
            </div>
            
            {submissionData.description && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm leading-relaxed">{submissionData.description}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (type === 'team_participation') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Team
              </div>
              <p className="text-lg font-semibold">
                {submissionData.team_type === 'fellow_friday_team' ? 'Fellow Friday Team' : 'Chapel Team'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Participation Date
              </div>
              <p className="text-lg">{formatDate(submissionData.date_of_participation)}</p>
            </div>
          </div>
          
          {submissionData.notes && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </div>
                <p className="text-sm leading-relaxed">{submissionData.notes}</p>
              </div>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
        <AlertCircle className="h-4 w-4 inline mr-2" />
        Unknown submission type: {type}
      </div>
    )
  }

  const SubmissionCard = ({ submission }: { submission: SubmissionData }) => {
    const IconComponent = getEventTypeIcon(submission.submission_data.submission_type)
    const user = submission.students?.users
    const studentName = user && user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown Student'
    const initials = user && user.first_name && user.last_name ? `${user.first_name[0]}${user.last_name[0]}` : 'US'
    const photoSrc = user?.photo || null
    
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border-2">
              {photoSrc ? (
                <AvatarImage src={photoSrc} alt={studentName} />
              ) : null}
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className="h-4 w-4 text-primary" />
                <Badge className={`${getEventTypeColor(submission.submission_data.submission_type)} text-xs font-medium`}>
                  {getEventTypeLabel(submission.submission_data.submission_type)}
                </Badge>
              </div>
              
              <CardTitle className="text-base leading-tight">
                {studentName}
              </CardTitle>
              
              <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{submission.students?.companies?.name || 'Unknown Company'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{formatShortDate(submission.submitted_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                {getSubmissionTypeRequirement(submission.submission_data.submission_type)}
              </p>
              
              {submission.submission_data.submission_type === 'community_service' && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{submission.submission_data.hours} hours</span>
                  <span className="text-muted-foreground">at {submission.submission_data.organization}</span>
                </div>
              )}
              
              {submission.submission_data.submission_type === 'job_promotion' && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3 w-3" />
                  <span className="font-medium">{submission.submission_data.promotion_title}</span>
                  <span className="text-muted-foreground">at {submission.submission_data.organization}</span>
                </div>
              )}
              
              {submission.submission_data.submission_type === 'credentials' && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-3 w-3" />
                  <span className="font-medium">{submission.submission_data.credential_name}</span>
                  <span className="text-muted-foreground">from {submission.submission_data.granting_organization}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm"
                className="flex-1"
                onClick={() => handleViewSubmission(submission, 'approve')}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => handleViewSubmission(submission, 'reject')}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Event Approvals</h1>
              <p className="text-muted-foreground">
                Review and approve student-submitted events
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-3 py-1 font-medium">
                {submissions.length} pending
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPendingSubmissions(true)}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">All caught up!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No pending submissions to review at this time. New submissions will appear here when students submit them.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => loadPendingSubmissions(true)}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Check for New Submissions
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map(submission => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col mx-4">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'} Submission
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2">
                      {selectedSubmission.students?.users?.photo ? (
                        <AvatarImage 
                          src={selectedSubmission.students.users.photo} 
                          alt={selectedSubmission.students?.users?.first_name && selectedSubmission.students?.users?.last_name ? 
                            `${selectedSubmission.students.users.first_name} ${selectedSubmission.students.users.last_name}` : 
                            'Student'
                          } 
                        />
                      ) : null}
                      <AvatarFallback className="text-sm font-semibold">
                        {selectedSubmission.students?.users?.first_name && selectedSubmission.students?.users?.last_name ? 
                          `${selectedSubmission.students.users.first_name[0]}${selectedSubmission.students.users.last_name[0]}` : 
                          'US'
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {selectedSubmission.students?.users?.first_name && selectedSubmission.students?.users?.last_name ? 
                          `${selectedSubmission.students.users.first_name} ${selectedSubmission.students.users.last_name}` : 
                          'Unknown Student'
                        }
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{selectedSubmission.students?.companies?.name || 'Unknown Company'}</span>
                        </div>
                        {selectedSubmission.students?.users?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${selectedSubmission.students.users.email}`} className="hover:underline">
                              {selectedSubmission.students.users.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-lg">Submission Details</h4>
                    <Badge className={getEventTypeColor(selectedSubmission.submission_data.submission_type)}>
                      {getEventTypeLabel(selectedSubmission.submission_data.submission_type)}
                    </Badge>
                  </div>
                  {renderSubmissionDetails(selectedSubmission.submission_data)}
                </div>

                {/* Photos */}
                {selectedSubmission.submission_data.photos && selectedSubmission.submission_data.photos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-4 w-4" />
                      <h4 className="font-medium">Photo Evidence</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedSubmission.submission_data.photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Form */}
                {actionType === 'approve' ? (
                  <div className="space-y-4 border-t pt-4">
                    {/* Show different points input based on submission type */}
                    {selectedSubmission.submission_data.submission_type === 'team_participation' ? (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Participation Rating *
                        </Label>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPointsToGrant(Math.max(0, pointsToGrant - 1))}
                            disabled={pointsToGrant <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-background min-w-[80px] justify-center">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="text-lg font-semibold">{pointsToGrant}</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPointsToGrant(Math.min(5, pointsToGrant + 1))}
                            disabled={pointsToGrant >= 5}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rate the student&apos;s participation level from 0 (no participation) to 5 (exceptional participation)
                        </p>
                      </div>
                    ) : selectedSubmission.submission_data.submission_type !== 'community_service' && (
                      <div className="space-y-2">
                        <Label htmlFor="points" className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Points to Grant *
                        </Label>
                        <Input
                          id="points"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={pointsToGrant}
                          onChange={(e) => setPointsToGrant(parseFloat(e.target.value) || 0)}
                          placeholder="10.0"
                          required
                          className="text-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the point value this submission should contribute to the student&apos;s Holistic GPA
                        </p>
                      </div>
                    )}
                    
                    {/* Show info message for community service */}
                    {selectedSubmission.submission_data.submission_type === 'community_service' && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-medium">Community Service Points</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Points for community service are automatically calculated based on hours contributed (1 point per hour). 
                          This submission will award <strong>{selectedSubmission.submission_data.hours} point{selectedSubmission.submission_data.hours !== 1 ? 's' : ''}</strong>.
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Approval Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any notes or feedback for the student..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Rejection Reason *
                      </Label>
                      <Textarea
                        id="reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide clear feedback to help the student improve future submissions..."
                        rows={4}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Please provide constructive feedback to help the student understand why their submission was rejected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproval}
              disabled={isProcessing || 
                (actionType === 'approve' && 
                  selectedSubmission?.submission_data.submission_type !== 'community_service' && 
                  selectedSubmission?.submission_data.submission_type !== 'team_participation' && 
                  pointsToGrant <= 0) || 
                (actionType === 'reject' && !rejectionReason.trim())}
              className="w-full sm:w-auto"
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionType === 'approve' ? 'Approve & Assign Points' : 'Reject Submission'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}