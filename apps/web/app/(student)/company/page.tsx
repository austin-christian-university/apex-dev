'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acu-apex/ui"
import { Badge } from "@acu-apex/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@acu-apex/ui"
import { Progress } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Users, Mail, Phone, Target, Search } from "lucide-react"
import { useState } from "react"

// Mock data - will be replaced with real data later
const mockCompanyInfo = {
  name: "Alpha Company",
  rank: 1,
  holisticGPA: 3.85,
  memberCount: 24,
  foundedYear: 2020,
  motto: "Excellence Through Unity",
  description: "Alpha Company represents the pinnacle of holistic development, leading in all four pillars of student growth."
}

const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Company Captain",
    email: "sarah.johnson@acu.edu",
    phone_number: "(555) 123-4567",
    holisticGPA: 3.95,
    avatar: null,
    isOfficer: true
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Vice Captain",
    email: "michael.chen@acu.edu",
    phone_number: "(555) 234-5678",
    holisticGPA: 3.89,
    avatar: null,
    isOfficer: true
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Secretary",
    email: "emily.rodriguez@acu.edu", 
    phone_number: "(555) 345-6789",
    holisticGPA: 3.82,
    avatar: null,
    isOfficer: true
  },
  {
    id: 4,
    name: "David Park",
    role: "Member",
    email: "david.park@acu.edu",
    phone_number: "(555) 456-7890",
    holisticGPA: 3.76,
    avatar: null,
    isOfficer: false
  },
  {
    id: 5,
    name: "Jessica Williams",
    role: "Member",
    email: "jessica.williams@acu.edu",
    phone_number: "(555) 567-8901",
    holisticGPA: 3.91,
    avatar: null,
    isOfficer: false
  }
]

const mockFourPillarsBreakdown = [
  { name: "Spiritual Standing", score: 3.9, color: "bg-blue-500" },
  { name: "Professional Standing", score: 3.8, color: "bg-green-500" },
  { name: "Academic Performance", score: 3.85, color: "bg-purple-500" },
  { name: "Team Execution", score: 3.88, color: "bg-orange-500" }
]

export default function CompanyPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter members based on search query
  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      {/* Company Header */}
      <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{mockCompanyInfo.name}</CardTitle>
            <Badge variant="secondary" className="bg-secondary/20">
              Rank #{mockCompanyInfo.rank}
            </Badge>
          </div>
          <CardDescription className="text-sm">
            {mockCompanyInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{mockCompanyInfo.holisticGPA}</p>
              <p className="text-xs text-muted-foreground">Holistic GPA</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{mockCompanyInfo.memberCount}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">"{mockCompanyInfo.motto}"</p>
            <p className="text-xs text-muted-foreground">Est. {mockCompanyInfo.foundedYear}</p>
          </div>
        </CardContent>
      </Card>

      {/* Four Pillars Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Four Pillars Performance</h2>
        </div>
        
        <div className="space-y-3">
          {mockFourPillarsBreakdown.map((pillar) => (
            <Card key={pillar.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{pillar.name}</p>
                  <p className="text-lg font-bold">{pillar.score}</p>
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
          {filteredMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || ""} />
                    <AvatarFallback className="text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-sm font-bold">{member.holisticGPA}</p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      {member.isOfficer && (
                        <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                <span>{member.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 