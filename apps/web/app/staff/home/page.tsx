'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Crown, Star, Trophy, Zap, Coffee, Target, Users, TrendingUp } from 'lucide-react'
import { useAuth } from "@/components/auth/auth-provider"

export default function StaffHomePage() {
  const { user } = useAuth()

  const funFacts = [
    "🎯 You're literally the backbone of student success!",
    "⚡ Your spreadsheet skills are legendary among mortals",
    "🏆 Coffee consumption: Approximately ∞ cups per day",
    "🌟 You make magic happen behind the scenes",
    "🚀 Student development expert extraordinaire",
    "📊 Data wizard and analytics ninja combined",
    "💡 The unsung hero of academic excellence",
    "🎨 Master of turning chaos into organized beauty"
  ]

  const achievements = [
    { icon: Crown, title: "Excel Overlord", description: "Mastered the ancient art of VLOOKUP" },
    { icon: Trophy, title: "Student Whisperer", description: "Can motivate students with a single email" },
    { icon: Star, title: "Event Orchestrator", description: "Makes complex schedules look effortless" },
    { icon: Zap, title: "Problem Solver Supreme", description: "Fixes things before they even break" },
    { icon: Coffee, title: "Caffeine Connoisseur", description: "Maintains optimal productivity levels" },
    { icon: Target, title: "Goal Crusher", description: "Turns ambitious visions into reality" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />
        <div className="relative container px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-primary to-secondary rounded-full shadow-2xl">
                  <Crown className="h-16 w-16 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
                    LEGENDARY
                  </Badge>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Welcome, Staff Superstar! 🌟
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {user?.first_name ? `Hey ${user.first_name}! ` : 'Hey there! '}
              You're not just staff... you're the <span className="text-primary font-semibold">architect of excellence</span>, 
              the <span className="text-secondary font-semibold">guardian of student success</span>, and quite possibly 
              the <span className="text-primary font-semibold">most caffeinated person</span> in the building! ☕
            </p>
          </div>
        </div>
      </div>

      {/* Fun Facts Section */}
      <div className="container px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Daily Reminders of Your Awesomeness</h2>
          <p className="text-muted-foreground">Because someone needs to appreciate your incredible work!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {funFacts.map((fact, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <p className="text-center font-medium leading-relaxed">{fact}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Epic Achievements</h2>
          <p className="text-muted-foreground">Unlocked through years of dedication and countless cups of coffee</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {achievements.map((achievement, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <achievement.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {achievement.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Your Impact by the Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">247</div>
                <div className="text-sm text-muted-foreground">Events Organized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">💯</div>
                <div className="text-sm text-muted-foreground">Awesome Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <div className="text-center mt-16 space-y-4">
          <h3 className="text-2xl font-bold">🚧 Under Construction 🚧</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're building some seriously cool staff tools that will make your already amazing work even more 
            amazing (if that's even possible). Think dashboards that would make Tony Stark jealous and 
            analytics that would impress Hermione Granger.
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <Users className="h-5 w-5 text-primary" />
            <TrendingUp className="h-5 w-5 text-secondary" />
            <Target className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}