// This is a hidden page that's not currently accessible from the main navigation
// but may have future use for testing and development purposes
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Loader2, Users, Database, CheckCircle, Info, TestTube, AlertCircle } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"

interface PopuliStudent {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  student_id?: string
  [key: string]: any
}

export default function PopuliActionsPage() {

  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<PopuliStudent[]>([])
  const [error, setError] = useState<string>('')
  const [lastAction, setLastAction] = useState<string>('')

  const fetchRandomStudents = async () => {
    setIsLoading(true)
    setError('')
    setLastAction('Fetch 5 Random Students')

    try {
      const response = await fetch('/api/populi?endpoint=people&limit=5')
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || `HTTP ${response.status}: ${response.statusText}`)
        return
      }

      if (result.error) {
        setError(result.error)
        return
      }

      // Handle both single object and array responses
      if (result.data) {
        const studentData = Array.isArray(result.data) ? result.data : [result.data]
        setStudents(studentData)
      } else if (Array.isArray(result)) {
        setStudents(result)
      } else {
        setStudents([result])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatStudentData = (students: PopuliStudent[]) => {
    if (!Array.isArray(students) || students.length === 0) {
      return <p className="text-muted-foreground">No student data returned</p>
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {students.map((student, index) => (
          <Card key={student.id || index} className="text-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">
                    {student.first_name && student.last_name 
                      ? `${student.first_name} ${student.last_name}`
                      : `Student ${student.id}`
                    }
                  </h4>
                  {student.email && (
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  )}
                  {student.student_id && (
                    <Badge variant="outline" className="mt-1">
                      ID: {student.student_id}
                    </Badge>
                  )}
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  View Raw JSON
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(student, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        ))}
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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Database className="h-8 w-8" />
                Populi Actions
              </h1>
              <p className="text-muted-foreground mt-1">
                Test and interact with the Populi API for data management
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              <TestTube className="h-4 w-4 mr-2" />
              Testing Tools
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Environment Setup Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Populi API Configuration</p>
                <p className="text-sm">
                  This page uses the Populi API integration configured in your environment variables.
                  Make sure <code className="bg-muted px-1 rounded">POPULI_API_KEY</code> and{' '}
                  <code className="bg-muted px-1 rounded">POPULI_URL</code> are properly set.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Data Actions
              </CardTitle>
              <CardDescription>
                Test various Populi API endpoints to fetch and display student information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={fetchRandomStudents}
                  disabled={isLoading}
                  variant="default"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Fetch 5 Random Students
                </Button>
                
                {/* Placeholder for future actions */}
                <Button variant="outline" size="lg" disabled>
                  <Database className="mr-2 h-4 w-4" />
                  More Actions Coming Soon
                </Button>
              </div>

              {/* Status Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {lastAction && !error && !isLoading && students.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully executed <Badge variant="secondary">{lastAction}</Badge> - 
                    Found {students.length} student record{students.length !== 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Display */}
          {students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Results ({students.length})
                </CardTitle>
                <CardDescription>
                  Data retrieved from Populi API
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formatStudentData(students)}
              </CardContent>
            </Card>
          )}

          {/* Future Development */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Coming Soon
              </CardTitle>
              <CardDescription>
                Additional Populi API testing and management features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Student Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Search students by criteria</li>
                    <li>• Fetch detailed student profiles</li>
                    <li>• View enrollment history</li>
                    <li>• Export student data</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Grade & Financial Data</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Retrieve student grades</li>
                    <li>• Check financial balances</li>
                    <li>• View payment history</li>
                    <li>• Generate reports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
