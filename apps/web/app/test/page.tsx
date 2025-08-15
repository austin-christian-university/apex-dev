'use client'

//disable all eslint rules for this file
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */


import { useState } from 'react'
import { extractTermShortName } from '@acu-apex/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Loader2, Users, Database, AlertCircle, CheckCircle, Info, Search, UserCheck, UserX, Network } from 'lucide-react'
import {
  getPopuliPeople,
  getPopuliStudents,
  getPopuliCourses,
  findBestPopuliPersonMatch,
  getPopuliPerson,
  getPopuliStudentEnrollments,
  getPopuliAcademicTerms,
  getPopuliStudentBalance,
  getPopuliStudent,
  getPopuliPersonBalances,
  getPopuliOnlinePaymentLink,
  callPopuliEndpoint,
  getPopuliStudentEnrollmentsExpanded,
  getPopuliCourseOffering,
} from '@/lib/populi'

interface PopuliPerson {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  student_id?: string
  [key: string]: any
}

interface PopuliStudent {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  [key: string]: any
}

interface PopuliCourse {
  id: string
  name?: string
  code?: string
  [key: string]: any
}

interface PopuliMatchResult {
  person: any | null
  confidence: 'high' | 'medium' | 'low' | null
  matchType: 'name_only' | 'email_only' | 'phone_only' | 'partial_name' | null
  error?: string
}

// Local debug types for course-term mapping
interface MappedCourseForTerm {
  enrollmentId: string | number
  courseOfferingId: string | number
  catalogCourseId?: string | number
  code?: string
  name?: string
  credits?: number
  letterGrade?: string
  finalGrade?: number
  termId?: string | number | null
  termName?: string | null
}

interface TermCoursesGroup {
  termId: string
  termName: string
  courses: MappedCourseForTerm[]
}

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [people, setPeople] = useState<PopuliPerson[]>([])
  const [students, setStudents] = useState<PopuliStudent[]>([])
  const [courses, setCourses] = useState<PopuliCourse[]>([])
  const [error, setError] = useState<string>('')
  const [lastRequest, setLastRequest] = useState<string>('')

  // Populi matching test state
  const [matchingForm, setMatchingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })
  const [matchingResult, setMatchingResult] = useState<PopuliMatchResult | null>(null)
  const [isMatchingLoading, setIsMatchingLoading] = useState(false)

  // Populi Debug Explorer state
  const [personId, setPersonId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [academicTermId, setAcademicTermId] = useState('')
  const [courseOfferingId, setCourseOfferingId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customEndpoint, setCustomEndpoint] = useState('')

  const [personResp, setPersonResp] = useState<any | null>(null)
  const [personExpandedResp, setPersonExpandedResp] = useState<any | null>(null)
  const [enrollmentsResp, setEnrollmentsResp] = useState<any | null>(null)
  const [termsResp, setTermsResp] = useState<any | null>(null)
  const [offeringsResp, setOfferingsResp] = useState<any | null>(null)
  const [finTxResp, setFinTxResp] = useState<any | null>(null)
  const [balanceResp, setBalanceResp] = useState<any | null>(null)
  const [genericResp, setGenericResp] = useState<any | null>(null)
  const [enrollmentsExpandedResp, setEnrollmentsExpandedResp] = useState<any | null>(null)
  const [termGroupedDebug, setTermGroupedDebug] = useState<any | null>(null)
  const [mappedGroups, setMappedGroups] = useState<TermCoursesGroup[] | null>(null)
  const [mappingError, setMappingError] = useState<string>('')

  const handleApiCall = async (endpoint: string, apiFunction: () => Promise<any>) => {
    setIsLoading(true)
    setError('')
    setLastRequest(endpoint)

    try {
      const result = await apiFunction()
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.data) {
        switch (endpoint) {
          case 'people':
            setPeople(Array.isArray(result.data) ? result.data : [result.data])
            break
          case 'students':
            setStudents(Array.isArray(result.data) ? result.data : [result.data])
            break
          case 'courses':
            setCourses(Array.isArray(result.data) ? result.data : [result.data])
            break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatchingTest = async () => {
    if (!matchingForm.firstName || !matchingForm.lastName || !matchingForm.email) {
      setError('First name, last name, and email are required')
      return
    }

    setIsMatchingLoading(true)
    setError('')
    setMatchingResult(null)

    try {
      const result = await findBestPopuliPersonMatch(
        matchingForm.firstName,
        matchingForm.lastName,
        matchingForm.email,
      )

      setMatchingResult(result)
      if (result.error) setError(result.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred during matching')
    } finally {
      setIsMatchingLoading(false)
    }
  }

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low' | null) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getMatchTypeLabel = (matchType: string | null) => {
    switch (matchType) {
      case 'name_only':
        return 'Full Name Match'
      case 'email_only':
        return 'Email Only'
      case 'phone_only':
        return 'Phone Only'
      case 'partial_name':
        return 'Partial Name'
      default:
        return 'Unknown'
    }
  }

  const formatData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-muted-foreground">No data returned</p>
    }
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data.slice(0, 10).map((item, index) => (
          <Card key={item.id || index} className="text-sm">
            <CardContent className="p-3">
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(item, null, 2)}</pre>
            </CardContent>
          </Card>
        ))}
        {data.length > 10 && (
          <p className="text-xs text-muted-foreground">Showing first 10 of {data.length} results</p>
        )}
      </div>
    )
  }

  const formatObject = (obj: any) => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      <Card className="text-sm">
        <CardContent className="p-3">
          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(obj, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-8">This should be soft black background with almost white text.</p>

      <div className="space-y-8">
        {/* Color Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Color Test</h2>
          <div className="bg-card text-card-foreground p-4 rounded-lg border">
            <h3 className="text-xl font-semibold mb-2">Card Component</h3>
            <p className="text-muted-foreground">This is muted text on a card background.</p>
          </div>

          <div className="flex gap-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">Primary Button</button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90">Secondary Button</button>
            <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90">Accent Button</button>
          </div>
        </div>

        {/* Populi API Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Populi API Test
          </h2>

          {/* Environment Variables Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Environment Variables Required</p>
                <p className="text-sm">Create a <code className="bg-muted px-1 rounded">.env.local</code> file in the <code className="bg-muted px-1 rounded">apps/web/</code> directory with:</p>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">{`# Populi API Configuration
POPULI_API_KEY=your-populi-api-key-here
POPULI_URL=https://austinchristianuniversity.populiweb.com/`}</pre>
                <p className="text-xs text-muted-foreground"><strong>Note:</strong> These variables are server-side only (no NEXT_PUBLIC_ prefix) to keep your API key secure.</p>
              </div>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Test different Populi API endpoints. Make sure your environment variables are configured.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleApiCall('people', getPopuliPeople)} disabled={isLoading} variant="outline">
                  {isLoading && lastRequest === 'people' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                  Test /api2/people
                </Button>
                <Button onClick={() => handleApiCall('students', getPopuliStudents)} disabled={isLoading} variant="outline">
                  {isLoading && lastRequest === 'students' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                  Test /api2/students
                </Button>
                <Button onClick={() => handleApiCall('courses', getPopuliCourses)} disabled={isLoading} variant="outline">
                  {isLoading && lastRequest === 'courses' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  Test /api2/courses
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {lastRequest && !error && !isLoading && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully called <Badge variant="secondary">{lastRequest}</Badge> endpoint
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Display */}
          {people.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  People Results ({people.length})
                </CardTitle>
              </CardHeader>
              <CardContent>{formatData(people)}</CardContent>
            </Card>
          )}

          {students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students Results ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>{formatData(students)}</CardContent>
            </Card>
          )}

          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Courses Results ({courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>{formatData(courses)}</CardContent>
            </Card>
          )}
        </div>

        {/* Populi Matching Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Populi Person Matching Test
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Person Matching Form</CardTitle>
              <CardDescription>Test the Populi person matching algorithm with different scenarios. This simulates the onboarding process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={matchingForm.firstName} onChange={(e) => setMatchingForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" value={matchingForm.lastName} onChange={(e) => setMatchingForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={matchingForm.email} onChange={(e) => setMatchingForm(prev => ({ ...prev, email: e.target.value }))} placeholder="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                  <Input id="phoneNumber" value={matchingForm.phoneNumber} onChange={(e) => setMatchingForm(prev => ({ ...prev, phoneNumber: e.target.value }))} placeholder="555-123-4567" />
                </div>
              </div>

              <Button onClick={handleMatchingTest} disabled={isMatchingLoading || !matchingForm.firstName || !matchingForm.lastName || !matchingForm.email} className="w-full">
                {isMatchingLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching for matches...</> : <><Search className="mr-2 h-4 w-4" />Test Person Matching</>}
              </Button>
            </CardContent>
          </Card>

          {matchingResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">{matchingResult.person ? <UserCheck className="h-5 w-5 text-green-600" /> : <UserX className="h-5 w-5 text-red-600" />}Matching Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchingResult.person ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getConfidenceColor(matchingResult.confidence)}>Confidence: {matchingResult.confidence?.toUpperCase() || 'NONE'}</Badge>
                      <Badge variant="outline">Type: {getMatchTypeLabel(matchingResult.matchType)}</Badge>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Matched Person Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">ID:</span> {matchingResult.person.id}</div>
                        <div><span className="font-medium">Name:</span> {matchingResult.person.first_name} {matchingResult.person.last_name}</div>
                        <div><span className="font-medium">Email:</span> {matchingResult.person.email || 'N/A'}</div>
                        <div><span className="font-medium">Student ID:</span> {matchingResult.person.student_id || 'N/A'}</div>
                      </div>
                    </div>
                    <details className="group">
                      <summary className="cursor-pointer font-medium text-sm">Raw Person Data</summary>
                      <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-x-auto">{JSON.stringify(matchingResult.person, null, 2)}</pre>
                    </details>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No matching person found in Populi</p>
                    {matchingResult.error && (<p className="text-sm text-destructive mt-2">Error: {matchingResult.error}</p>)}
                  </div>
                )}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Matching Strategy Used</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">The system tried multiple matching strategies in order of confidence:</p>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-decimal list-inside">
                    <li><strong>Full name match:</strong> First name + Last name (High confidence)</li>
                    <li><strong>Email match:</strong> Email address only (High confidence)</li>
                    <li><strong>Partial match:</strong> Partial name matching (Low confidence)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Test Scenarios</CardTitle>
              <CardDescription>Try these scenarios to test different matching strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setMatchingForm({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phoneNumber: '555-123-4567' })}>Full Name Match Test</Button>
                <Button variant="outline" onClick={() => setMatchingForm({ firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phoneNumber: '' })}>Email Only Test</Button>
                <Button variant="outline" onClick={() => setMatchingForm({ firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', phoneNumber: '' })}>Partial Name Test</Button>
                <Button variant="outline" onClick={() => setMatchingForm({ firstName: 'Alice', lastName: 'Brown', email: 'alice.brown@example.com', phoneNumber: '' })}>Partial Match Test</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Populi Debug Explorer */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Populi Debug Explorer
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Provide identifiers and run individual calls step-by-step</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personId">Person ID</Label>
                  <Input id="personId" value={personId} onChange={(e) => setPersonId(e.target.value)} placeholder="e.g., 55782" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., STU001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termId">Academic Term ID</Label>
                  <Input id="termId" value={academicTermId} onChange={(e) => setAcademicTermId(e.target.value)} placeholder="e.g., 202401" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offeringId">Course Offering ID</Label>
                  <Input id="offeringId" value={courseOfferingId} onChange={(e) => setCourseOfferingId(e.target.value)} placeholder="e.g., 21910" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Raw Endpoint</Label>
                  <Input id="endpoint" value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} placeholder="e.g., people/55782" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={async () => { const r = await getPopuliPerson(personId); setPersonResp(r); }}>Get Person</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliStudentEnrollments(personId, academicTermId || undefined); setEnrollmentsResp(r); }}>Get Enrollments</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliStudentEnrollmentsExpanded(personId, 'courseoffering', academicTermId || undefined); setEnrollmentsExpandedResp(r); }}>Get Enrollments (expanded)</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliAcademicTerms(); setTermsResp(r); }}>Get Academic Terms</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliCourseOffering(courseOfferingId); setOfferingsResp(r); }}>Get Course Offering</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliStudentBalance(personId); setBalanceResp(r); }}>Get Student Balance</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliStudent(personId); setPersonResp(r); }}>Get Student</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliPersonBalances(); setGenericResp(r); }}>Get All Balances</Button>
                <Button variant="outline" onClick={async () => { const r = await getPopuliOnlinePaymentLink(personId); setGenericResp(r); }}>Get Payment Link</Button>
                <Button variant="outline" onClick={async () => { const r = await callPopuliEndpoint(customEndpoint); setGenericResp(r); }}>Call Raw Endpoint</Button>
                <Button variant="outline" onClick={async () => {
                  // Build a simple grouping by term from expanded enrollments + terms
                  const [enRes, termsRes] = await Promise.all([
                    getPopuliStudentEnrollmentsExpanded(personId, 'courseoffering', academicTermId || undefined),
                    getPopuliAcademicTerms()
                  ])
                  setEnrollmentsExpandedResp(enRes)
                  setTermsResp(termsRes)
                  const enrollmentsArray = Array.isArray((enRes as any).data?.data)
                    ? (enRes as any).data.data
                    : Array.isArray(enRes.data) ? enRes.data : []
                  const termsArray = Array.isArray((termsRes as any).data?.data)
                    ? (termsRes as any).data.data
                    : Array.isArray(termsRes.data) ? termsRes.data : []
                  const termMap: Record<string, string> = {}
                  termsArray.forEach((t: any) => {
                    if (t?.id) termMap[String(t.id)] = extractTermShortName(t.display_name) || t.display_name || t.name || String(t.id)
                  })
                  const groups: Record<string, any[]> = {}
                  enrollmentsArray.forEach((en: any) => {
                    const termIdExpanded = en?.courseoffering?.academic_term_id ?? en?.courseoffering?.term_id ?? null
                    const termIdDirect = en?.academic_term_id ?? null
                    const termId = termIdExpanded ?? termIdDirect
                    const key = termId ? String(termId) : 'Unknown Term'
                    if (!groups[key]) groups[key] = []
                    const codeExpanded = en?.courseoffering?.catalog_courses?.[0]?.abbrv ?? en?.courseoffering?.abbrv
                    const nameExpanded = en?.courseoffering?.catalog_courses?.[0]?.name ?? en?.courseoffering?.name
                    groups[key].push({
                      enrollment_id: en.id,
                      course_offering_id: en.course_offering_id,
                      catalog_course_id: en.catalog_course_id,
                      term_id_expanded: termIdExpanded,
                      term_id_direct: termIdDirect,
                      term_id_used: termId ?? null,
                      term_name: termId ? (termMap[String(termId)] || null) : null,
                      term_mismatch: termIdExpanded !== null && termIdDirect !== null && String(termIdExpanded) !== String(termIdDirect),
                      course_abbrv: codeExpanded,
                      course_name: nameExpanded,
                      letter_grade: en.letter_grade,
                      final_grade: en.final_grade,
                      credits: en.credits ?? en.courseoffering?.credits ?? null
                    })
                  })
                  setTermGroupedDebug(groups)
                }}>Group By Term (debug)</Button>
                <Button variant="outline" onClick={async () => {
                  // Full mapping flow via course offerings
                  setMappingError('')
                  setMappedGroups(null)
                  try {
                    // 1) Academic terms
                    const termsRes = await getPopuliAcademicTerms()
                    const termsArray = Array.isArray((termsRes as any).data?.data)
                      ? (termsRes as any).data.data
                      : Array.isArray(termsRes.data) ? termsRes.data : []
                  const termMap: Record<string, string> = {}
                  termsArray.forEach((t: any) => {
                    if (t?.id) termMap[String(t.id)] = extractTermShortName(t.display_name) || t.display_name || t.name || String(t.id)
                  })

                    // 2) Enrollments (non-expanded)
                    const enrollRes = await getPopuliStudentEnrollments(personId, academicTermId || undefined)
                    const enrollmentsArray: any[] = Array.isArray((enrollRes as any).data?.data)
                      ? (enrollRes as any).data.data
                      : Array.isArray(enrollRes.data) ? enrollRes.data : []
                    if (!Array.isArray(enrollmentsArray) || enrollmentsArray.length === 0) {
                      setMappedGroups([])
                      return
                    }

                    // 3) Fetch offerings for unique course_offering_id
                    const uniqueOfferingIds = Array.from(new Set(
                      enrollmentsArray.map((en: any) => en.course_offering_id).filter(Boolean)
                    ))
                    const offeringMap: Record<string, any> = {}
                    await Promise.all(uniqueOfferingIds.map(async (id: any) => {
                      const o = await getPopuliCourseOffering(String(id))
                      const payload = (o as any).data?.data ?? o.data
                      const offering = Array.isArray(payload) ? payload[0] : payload
                      offeringMap[String(id)] = offering
                    }))

                    // 4+5) Build mapped rows and group by term
                    const groupsByTermId: Record<string, MappedCourseForTerm[]> = {}
                    for (const en of enrollmentsArray) {
                      const off = offeringMap[String(en.course_offering_id)] || {}
                      const termId = off?.academic_term_id ?? off?.term_id ?? null
                      const termKey = termId ? String(termId) : 'Unknown Term'
                      if (!groupsByTermId[termKey]) groupsByTermId[termKey] = []
                      const catalogCourse = Array.isArray(off?.catalog_courses) ? off.catalog_courses[0] : undefined
                      groupsByTermId[termKey].push({
                        enrollmentId: en.id,
                        courseOfferingId: en.course_offering_id,
                        catalogCourseId: en.catalog_course_id,
                        code: catalogCourse?.abbrv ?? off?.abbrv ?? undefined,
                        name: catalogCourse?.name ?? off?.name ?? undefined,
                        credits: en?.credits ?? off?.credits ?? undefined,
                        letterGrade: typeof en?.letter_grade === 'string' ? en.letter_grade : undefined,
                        finalGrade: typeof en?.final_grade === 'number' ? en.final_grade : undefined,
                        termId,
                        termName: termId ? (termMap[String(termId)] || null) : null,
                      })
                    }

                    const groupsArr: TermCoursesGroup[] = Object.entries(groupsByTermId).map(([tid, courses]) => ({
                      termId: tid,
                      termName: tid !== 'Unknown Term' ? (termMap[tid] || tid) : 'Unknown Term',
                      courses,
                    }))
                    setMappedGroups(groupsArr)
                  } catch (err) {
                    setMappingError(err instanceof Error ? err.message : 'Mapping failed')
                  }
                }}>Map Courses to Terms (via offerings)</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personResp && (
              <Card>
                <CardHeader><CardTitle>Person</CardTitle></CardHeader>
                <CardContent>{formatObject(personResp)}</CardContent>
              </Card>
            )}
            {personExpandedResp && (
              <Card>
                <CardHeader><CardTitle>Person (expanded)</CardTitle></CardHeader>
                <CardContent>{formatObject(personExpandedResp)}</CardContent>
              </Card>
            )}
            {enrollmentsResp && (
              <Card>
                <CardHeader><CardTitle>Enrollments</CardTitle></CardHeader>
                <CardContent>{formatObject(enrollmentsResp)}</CardContent>
              </Card>
            )}
            {enrollmentsExpandedResp && (
              <Card>
                <CardHeader><CardTitle>Enrollments (expanded)</CardTitle></CardHeader>
                <CardContent>{formatObject(enrollmentsExpandedResp)}</CardContent>
              </Card>
            )}
            {termsResp && (
              <Card>
                <CardHeader><CardTitle>Academic Terms</CardTitle></CardHeader>
                <CardContent>{formatObject(termsResp)}</CardContent>
              </Card>
            )}
            {offeringsResp && (
              <Card>
                <CardHeader><CardTitle>Course Offerings</CardTitle></CardHeader>
                <CardContent>{formatObject(offeringsResp)}</CardContent>
              </Card>
            )}
            {finTxResp && (
              <Card>
                <CardHeader><CardTitle>Financial Transactions</CardTitle></CardHeader>
                <CardContent>{formatObject(finTxResp)}</CardContent>
              </Card>
            )}
            {balanceResp && (
              <Card>
                <CardHeader><CardTitle>Student Balance</CardTitle></CardHeader>
                <CardContent>{formatObject(balanceResp)}</CardContent>
              </Card>
            )}
            {genericResp && (
              <Card>
                <CardHeader><CardTitle>Raw Endpoint Response</CardTitle></CardHeader>
                <CardContent>{formatObject(genericResp)}</CardContent>
              </Card>
            )}
            {termGroupedDebug && (
              <Card>
                <CardHeader><CardTitle>Grouped By Term (debug)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Object.entries(termGroupedDebug).map(([term, rows]) => (
                      <Card key={term} className="text-sm">
                        <CardHeader>
                          <CardTitle className="text-sm">Term: {term}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(rows, null, 2)}</pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {mappingError && (
              <Card>
                <CardHeader><CardTitle>Mapping Error</CardTitle></CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{mappingError}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
            {mappedGroups && (
              <Card>
                <CardHeader><CardTitle>Mapped Courses by Term (Offerings method)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mappedGroups.map(group => (
                      <div key={group.termId} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{group.termName}</div>
                          <Badge variant="secondary">{group.courses.length} courses</Badge>
                        </div>
                        <div className="space-y-2">
                          {group.courses.map((c) => (
                            <div key={`${group.termId}-${c.courseOfferingId}-${c.enrollmentId}`} className="text-sm grid grid-cols-1 md:grid-cols-5 gap-2">
                              <div>
                                <div className="font-medium">{c.code || String(c.courseOfferingId)}</div>
                                <div className="text-muted-foreground text-xs">Offering #{c.courseOfferingId}</div>
                              </div>
                              <div className="md:col-span-2">
                                <div>{c.name || 'Unknown Course'}</div>
                                <div className="text-muted-foreground text-xs">Catalog #{c.catalogCourseId}</div>
                              </div>
                              <div>
                                <div>Credits: {c.credits ?? '—'}</div>
                                <div className="text-muted-foreground text-xs">Enrollment #{c.enrollmentId}</div>
                              </div>
                              <div>
                                <div>Grade: {c.letterGrade ?? (typeof c.finalGrade === 'number' ? `${Math.round(c.finalGrade)}%` : 'In Progress')}</div>
                                <div className="text-muted-foreground text-xs">Term: {c.termName || 'Unknown'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}