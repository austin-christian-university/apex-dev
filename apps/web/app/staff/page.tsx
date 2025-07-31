import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Construction, Users, BarChart3, Settings, ArrowLeft } from 'lucide-react'

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">ACU Apex - Staff Portal</h1>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-secondary/10 rounded-full">
                <Construction className="h-12 w-12 text-secondary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Staff Portal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The comprehensive staff dashboard is currently under development. 
              We're building powerful tools to help you manage the ACU Apex program effectively.
            </p>
          </div>

          {/* Coming Soon Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Student Management</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View and manage all students across companies, track their progress, 
                  and access detailed performance analytics.
                </CardDescription>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Student roster management</li>
                  <li>• Cross-company analytics</li>
                  <li>• Performance tracking</li>
                  <li>• Individual student profiles</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Advanced Reporting</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate comprehensive reports on program effectiveness, 
                  student outcomes, and company performance metrics.
                </CardDescription>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Program-wide analytics</li>
                  <li>• Custom report generation</li>
                  <li>• Trend analysis</li>
                  <li>• Export capabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Settings className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Program Administration</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Configure program settings, manage companies, approve role requests, 
                  and oversee system-wide configurations.
                </CardDescription>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Role approval management</li>
                  <li>• Company configuration</li>
                  <li>• System settings</li>
                  <li>• User access control</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Development Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Development Timeline</CardTitle>
              <CardDescription>
                Here's what we're working on for the staff portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <div>
                    <p className="font-medium">Phase 1: Student Overview Dashboard</p>
                    <p className="text-sm text-muted-foreground">Basic student roster and company overview</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div>
                    <p className="font-medium">Phase 2: Advanced Analytics</p>
                    <p className="text-sm text-muted-foreground">Comprehensive reporting and data visualization</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <div>
                    <p className="font-medium">Phase 3: Administrative Tools</p>
                    <p className="text-sm text-muted-foreground">Role management and system configuration</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temporary Access Note */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">Need Access Now?</h3>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  If you need immediate access to student data or administrative functions, 
                  please contact the development team. We can provide temporary access to 
                  essential features while the full staff portal is being developed.
                </p>
                <Button variant="outline">
                  Contact Development Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}