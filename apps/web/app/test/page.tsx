'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Loader2, Users, Database, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { getPopuliPeople, getPopuliStudents, getPopuliCourses } from '@/lib/populi'

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

export default function TestPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [people, setPeople] = useState<PopuliPerson[]>([])
    const [students, setStudents] = useState<PopuliStudent[]>([])
    const [courses, setCourses] = useState<PopuliCourse[]>([])
    const [error, setError] = useState<string>('')
    const [lastRequest, setLastRequest] = useState<string>('')

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

    const formatData = (data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) {
            return <p className="text-muted-foreground">No data returned</p>
        }

        return (
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.slice(0, 10).map((item, index) => (
                    <Card key={item.id || index} className="text-sm">
                        <CardContent className="p-3">
                            <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(item, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                ))}
                {data.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                        Showing first 10 of {data.length} results
                    </p>
                )}
            </div>
        )
    }

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
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                            Primary Button
                        </button>
                        <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90">
                            Secondary Button
                        </button>
                        <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90">
                            Accent Button
                        </button>
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
                                <p className="text-sm">
                                    Create a <code className="bg-muted px-1 rounded">.env.local</code> file in the <code className="bg-muted px-1 rounded">apps/web/</code> directory with:
                                </p>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`# Populi API Configuration
POPULI_API_KEY=your-populi-api-key-here
POPULI_URL=https://austinchristianuniversity.populiweb.com/`}
                                </pre>
                                <p className="text-xs text-muted-foreground">
                                    <strong>Note:</strong> These variables are server-side only (no NEXT_PUBLIC_ prefix) to keep your API key secure.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>API Endpoints</CardTitle>
                            <CardDescription>
                                Test different Populi API endpoints. Make sure your environment variables are configured.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Button 
                                    onClick={() => handleApiCall('people', getPopuliPeople)}
                                    disabled={isLoading}
                                    variant="outline"
                                >
                                    {isLoading && lastRequest === 'people' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Users className="mr-2 h-4 w-4" />
                                    )}
                                    Test /api2/people
                                </Button>
                                
                                <Button 
                                    onClick={() => handleApiCall('students', getPopuliStudents)}
                                    disabled={isLoading}
                                    variant="outline"
                                >
                                    {isLoading && lastRequest === 'students' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Users className="mr-2 h-4 w-4" />
                                    )}
                                    Test /api2/students
                                </Button>
                                
                                <Button 
                                    onClick={() => handleApiCall('courses', getPopuliCourses)}
                                    disabled={isLoading}
                                    variant="outline"
                                >
                                    {isLoading && lastRequest === 'courses' ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Database className="mr-2 h-4 w-4" />
                                    )}
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
                            <CardContent>
                                {formatData(people)}
                            </CardContent>
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
                            <CardContent>
                                {formatData(students)}
                            </CardContent>
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
                            <CardContent>
                                {formatData(courses)}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}