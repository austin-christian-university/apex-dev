'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Textarea } from '@acu-apex/ui'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Building2, 
  Calendar, 
  Award,
  Briefcase,
  Heart,
  AlertCircle
} from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"
import { getPendingSubmissions, approveSubmission, rejectSubmission } from '@/lib/non-routine-events'
import { formatDate, formatDateTime } from '@acu-apex/utils'

interface SubmissionData {
  id: string
  submission_data: any
  created_at: string
  students: {
    id: string
    users: {
      id: string
      first_name: string
      last_name: string
      email: string
    }
    companies: {
      id: string
      name: string
    }
  }
}

export default function StaffApprovalsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pointsToGrant, setPointsToGrant] = useState<number>(0)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

  // Load pending submissions
  useEffect(() => {
    loadPendingSubmissions()
  }, [])

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true)
      const result = await getPendingSubmissions()
      if (result.success) {
        setSubmissions(result.submissions)
      } else {
        console.error('Failed to load submissions:', result.error)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeIcon = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return Heart
      case 'job_promotion': return Briefcase
      case 'credentials': return Award
      default: return Clock
    }
  }

  const getEventTypeColor = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'job_promotion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'credentials': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getEventTypeLabel = (submissionType: string) => {
    switch (submissionType) {
      case 'community_service': return 'Community Service'
      case 'job_promotion': return 'Job Promotion'
      case 'credentials': return 'Credentials'
      default: return submissionType
    }
  }

  const handleViewSubmission = (submission: SubmissionData, action: 'approve' | 'reject' = 'approve') => {
    setSelectedSubmission(submission)
    setActionType(action)
    setPointsToGrant(0)
    setRejectionReason('')
    setShowApprovalDialog(true)
  }

  const handleApproval = async () => {
    if (!selectedSubmission) return

    setIsProcessing(true)
    try {
      let result
      if (actionType === 'approve') {
        result = await approveSubmission(selectedSubmission.id, pointsToGrant)
      } else {
        result = await rejectSubmission(selectedSubmission.id, rejectionReason)
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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Hours:</span>
              <p>{submissionData.hours}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Date:</span>
              <p>{formatDate(submissionData.date_of_service)}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Organization:</span>
            <p>{submissionData.organization}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Supervisor:</span>
            <p>{submissionData.supervisor_name} ({submissionData.supervisor_contact})</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Description:</span>
            <p className="text-sm">{submissionData.description}</p>
          </div>
        </div>
      )
    }

    if (type === 'job_promotion') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Title:</span>
              <p>{submissionData.promotion_title}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Date:</span>
              <p>{formatDate(submissionData.date_of_promotion)}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Organization:</span>
            <p>{submissionData.organization}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Supervisor:</span>
            <p>{submissionData.supervisor_name} ({submissionData.supervisor_contact})</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Description:</span>
            <p className="text-sm">{submissionData.description}</p>
          </div>
        </div>
      )
    }

    if (type === 'credentials') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Credential:</span>
              <p>{submissionData.credential_name}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Date:</span>
              <p>{formatDate(submissionData.date_of_credential)}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Granting Organization:</span>
            <p>{submissionData.granting_organization}</p>
          </div>
          {submissionData.description && (
            <div>
              <span className="font-medium text-muted-foreground">Description:</span>
              <p className="text-sm">{submissionData.description}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="text-sm text-muted-foreground">
        Unknown submission type: {type}
      </div>
    )
  }

  const SubmissionCard = ({ submission }: { submission: SubmissionData }) => {
    const IconComponent = getEventTypeIcon(submission.submission_data.submission_type)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">
                  {getEventTypeLabel(submission.submission_data.submission_type)}
                </CardTitle>
                <Badge className={getEventTypeColor(submission.submission_data.submission_type)}>
                  Pending
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Submitted by {submission.students.users.first_name} {submission.students.users.last_name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{submission.students.users.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{submission.students.companies.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Submitted {formatDateTime(submission.created_at)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleViewSubmission(submission, 'approve')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewSubmission(submission, 'reject')}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleViewSubmission(submission, 'approve')}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user || !['staff', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need staff permissions to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Event Approvals</h1>
              <p className="text-muted-foreground mt-1">
                Review and approve student-submitted events
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {submissions.length} pending
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground">
                  No pending submissions to review at this time.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map(submission => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col mx-4 sm:max-w-2xl sm:w-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Submission
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedSubmission.students.users.first_name} {selectedSubmission.students.users.last_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedSubmission.students.companies.name}</span>
                  </div>
                </div>

                {/* Submission Details */}
                <div>
                  <h4 className="font-medium mb-3">Submission Details</h4>
                  {renderSubmissionDetails(selectedSubmission.submission_data)}
                </div>

                {/* Photos */}
                {selectedSubmission.submission_data.photos && selectedSubmission.submission_data.photos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Photo Evidence</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedSubmission.submission_data.photos.map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Form */}
                {actionType === 'approve' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="points">Points to Grant *</Label>
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
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the point value this submission should contribute to the student's Holistic GPA
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Rejection Reason (Optional)</Label>
                      <Textarea
                        id="reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide feedback to help the student improve future submissions..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
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
                    disabled={isProcessing || (actionType === 'approve' && pointsToGrant <= 0)}
                    className="w-full sm:w-auto"
                    variant={actionType === 'approve' ? 'default' : 'destructive'}
                  >
                    {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Approve & Assign Points' : 'Reject Submission'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}