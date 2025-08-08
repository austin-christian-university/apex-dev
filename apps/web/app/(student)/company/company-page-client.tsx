'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Progress } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Users, Mail, Phone, Target, Search } from "lucide-react"
import { useState } from "react"
import type { CompanyDetails } from '@/lib/company'

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

const categoryColors: Record<string, string> = {
  spiritual: "bg-blue-500",
  professional: "bg-green-500",
  academic: "bg-purple-500", 
  team: "bg-orange-500"
}

export default function CompanyPageClient({ companyDetails }: CompanyPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter members based on search query
  const filteredMembers = companyDetails.members.filter(member =>
    member.user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.student.company_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format company establishment year from created_at
  const foundedYear = companyDetails.company.created_at 
    ? new Date(companyDetails.company.created_at).getFullYear()
    : new Date().getFullYear()

  // Generate category breakdown from real data or fallback to mock data
  const categoryBreakdown = companyDetails.categoryBreakdown 
    ? Object.entries(companyDetails.categoryBreakdown).map(([category, score]) => ({
        name: categoryDisplayNames[category] || category,
        score: score,
        color: categoryColors[category] || "bg-gray-500"
      }))
    : [
        { name: "Spiritual Standing", score: 3.9, color: "bg-blue-500" },
        { name: "Professional Standing", score: 3.8, color: "bg-green-500" },
        { name: "Academic Performance", score: 3.85, color: "bg-purple-500" },
        { name: "Team Execution", score: 3.88, color: "bg-orange-500" }
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
            {companyDetails.company.description}
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
          {companyDetails.company.motto && (
            <div className="text-center">
              <p className="text-sm font-medium">"{companyDetails.company.motto}"</p>
              <p className="text-xs text-muted-foreground">Est. {foundedYear}</p>
            </div>
          )}
          {companyDetails.company.vision && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground italic">{companyDetails.company.vision}</p>
            </div>
          )}
          {companyDetails.company.quote && (
            <div className="text-center border-t pt-3 mt-3">
              <p className="text-xs text-muted-foreground italic">"{companyDetails.company.quote}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Four Pillars Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Four Pillars Performance</h2>
        </div>
        
        <div className="space-y-3">
          {categoryBreakdown.map((pillar) => (
            <Card key={pillar.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{pillar.name}</p>
                  <p className="text-lg font-bold">{pillar.score.toFixed(2)}</p>
                </div>
                <Progress value={pillar.score * 25} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
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
            const isOfficer = member.student.company_role && member.student.company_role !== 'Member'
            
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
                        <p className="text-sm font-bold">{member.holisticGPA.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        {isOfficer && member.student.company_role && (
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