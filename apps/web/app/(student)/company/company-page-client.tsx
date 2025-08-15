'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@acu-apex/ui"
import { Users, Mail, Phone, Search } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { useState } from "react"
import type { CompanyDetails } from '@/lib/company'
import { useAuth } from '@/components/auth/auth-provider'

interface CompanyPageClientProps {
  companyDetails: CompanyDetails
}

// Category display names and colors
const categoryDisplayNames: Record<string, string> = {
  spiritual: "Spiritual Standing",
  professional: "Professional Standing", 
  academic: "Academic Performance",
  team: "Team Execution"
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function CompanyPageClient({ companyDetails }: CompanyPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  // Determine if current user is an officer
  const isOfficer = user?.role === 'officer'

  // Filter and sort members based on search query and role
  let filteredMembers = companyDetails.members.filter(member =>
    member.user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.student.company_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort by holistic GPA (descending) only if current user is an officer
  if (isOfficer) {
    filteredMembers = filteredMembers.sort((a, b) => b.holisticGPA - a.holisticGPA)
  }

  // Format company establishment year from created_at
  const foundedYear = companyDetails.company.created_at 
    ? new Date(companyDetails.company.created_at).getFullYear()
    : new Date().getFullYear()

  // Generate radar chart data from company breakdown - matching home and profile page patterns
  const radarChartData = companyDetails.categoryBreakdown 
    ? Object.entries(companyDetails.categoryBreakdown).map(([categoryId, score], index) => {
        // Handle UUID category IDs by providing fallback names
        let pillarName = categoryDisplayNames[categoryId]
        
        if (!pillarName) {
          // If it's a UUID, provide generic fallback names in order
          const fallbackNames = ["Spiritual", "Professional", "Academic", "Team"]
          pillarName = fallbackNames[index] || `Category ${index + 1}`
        } else {
          // Apply same transformations as home/profile pages
          pillarName = pillarName.replace(' Standing', '').replace(' Performance', '').replace(' Execution', '')
        }
        
        return {
          categoryId,
          pillar: pillarName,
          score: Number(score) || 0,
          fullScore: 4.0
        }
      })
    : [
        { categoryId: "spiritual", pillar: "Spiritual", score: 3.9, fullScore: 4.0 },
        { categoryId: "professional", pillar: "Professional", score: 3.8, fullScore: 4.0 },
        { categoryId: "academic", pillar: "Academic", score: 3.85, fullScore: 4.0 },
        { categoryId: "team", pillar: "Team", score: 3.88, fullScore: 4.0 }
      ]

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Company Header */}
      <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{companyDetails.company.name}</CardTitle>
            <Badge variant="secondary" className="bg-secondary/20">
              Rank #{companyDetails.rank}
            </Badge>
          </div>
          <CardDescription className="text-sm">
            {companyDetails.company.description || "Your company description"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{companyDetails.holisticGPA.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Holistic GPA</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{companyDetails.memberCount}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">&quot;{companyDetails.company.motto || "Your company motto"}&quot;</p>
            <p className="text-xs text-muted-foreground">Est. {foundedYear}</p>
          </div>
          {companyDetails.company.vision && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground italic">{companyDetails.company.vision}</p>
            </div>
          )}
          {companyDetails.company.quote && (
            <div className="text-center border-t pt-3 mt-3">
              <p className="text-xs text-muted-foreground italic">&quot;{companyDetails.company.quote}&quot;</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holistic Company Score */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-center">Holistic Company Score</h2>
        
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[270px] w-full"
        >
          <RadarChart data={radarChartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 12 }} />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill="var(--color-score)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </div>

      {/* All Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Members ({filteredMembers.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-40 h-8 text-sm"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const fullName = `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim()
            const initials = `${member.user.first_name?.[0] || ''}${member.user.last_name?.[0] || ''}`.toUpperCase()
            
            return (
              <Card key={member.user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.user.photo || ""} />
                      <AvatarFallback className="text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{fullName}</p>
                        {isOfficer && (
                          <p className="text-sm font-bold">{member.holisticGPA.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        {member.student.company_role && member.student.company_role !== 'Member' && (
                          <Badge variant="secondary" className="text-xs">{member.student.company_role}</Badge>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{member.user.email}</span>
                        </div>
                        {member.user.phone_number && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{member.user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No members match your search.' : 'No members found.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}