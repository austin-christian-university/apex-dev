"use client"

import { useState, useEffect } from "react"
import { getAllStudents, type Student } from "@/lib/data"
import { CompanyStandings } from "@/components/company-standings"
import { CompanyHistory } from "@/components/company-history"
import { StudentScoresTable } from "@/components/student-scores-table"
import { Badge } from "@/components/ui/badge"

interface CompanyStanding {
  name: string
  totalScore: number
  studentCount: number
  averageScore: number
}

// Calculate company standings
const calculateCompanyStandings = (students: Student[]): CompanyStanding[] => {
  const companies = ["Alpha Company", "Bravo Company", "Charlie Company", "Delta Company"]
  
  return companies.map(company => {
    const companyStudents = students.filter(student => student.company === company)
    const totalScore = companyStudents.reduce((sum, student) => {
      const studentScore = Object.values(student.score).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0)
      return sum + studentScore
    }, 0)
    
    return {
      name: company,
      totalScore: Math.round(totalScore),
      studentCount: companyStudents.length,
      averageScore: Math.round(totalScore / companyStudents.length)
    }
  }).sort((a, b) => b.totalScore - a.totalScore)
}

// Helper function to check if user is a student leader
const isStudentLeader = (role: string) => {
  return role === "President" || role === "Officer"
}

// Helper function to check if user is a normal student
const hasNormalStudentRole = (role: string): boolean => {
  return role === "Member"
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("Alpha Company")
  const [companyStandings, setCompanyStandings] = useState<CompanyStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<{ type: string; user: Student | any } | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const storedUserType = localStorage.getItem("userType")
    const storedUserData = localStorage.getItem("userData")
    
    if (storedUserType && storedUserData) {
      try {
        const userType = storedUserType
        const user = JSON.parse(storedUserData)
        setUserData({ type: userType, user })

        // If user is a student leader, set their company as selected
        if (userType === "student" && isStudentLeader(user.companyRole)) {
          setSelectedCompany(user.company)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allStudents = await getAllStudents()
        setStudents(allStudents)
        setCompanyStandings(calculateCompanyStandings(allStudents))
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Filter students based on user role
  const filteredStudents = students.filter(student => {
    if (userData?.type === "admin") return true
    if (userData?.type === "student") {
      if (isStudentLeader(userData.user.companyRole)) {
        return student.company === userData.user.company
      }
      if (hasNormalStudentRole(userData.user.companyRole)) {
        return student.id === userData.user.id // Only show the logged-in student
      }
    }
    return student.company === selectedCompany
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const isLeader = userData?.type === "student" && isStudentLeader(userData.user.companyRole)
  const isNormalStudentView = userData?.type === "student" && hasNormalStudentRole(userData.user.companyRole)

  return (
    <div className="w-[100vw] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Company standings and history in a responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 max-w-[90vw]">
        <div className="lg:col-span-1 w-full">
          <CompanyStandings standings={companyStandings} />
        </div>
        <div className="lg:col-span-3 w-full">
          <CompanyHistory companyStandings={companyStandings} />
        </div>
      </div>

      {/* Student scores table with horizontal scroll */}
      <div className="w-full mt-6 max-w-[90vw]">
        <StudentScoresTable
          students={filteredStudents}
          selectedCompany={selectedCompany}
          onCompanyChange={setSelectedCompany}
          isLeader={isLeader}
          isNormalStudent={isNormalStudentView}
        />
      </div>
    </div>
  )
}
