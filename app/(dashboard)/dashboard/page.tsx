"use client"

import { useState, useEffect } from "react"
import { getAllStudents, type Student } from "@/lib/data"
import { CompanyStandings } from "@/components/company-standings"
import { CompanyHistory } from "@/components/company-history"
import { StudentScoresTable } from "@/components/student-scores-table"

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

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("Alpha Company")
  const [companyStandings, setCompanyStandings] = useState<CompanyStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)


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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CompanyStandings standings={companyStandings} />
        </div>
        <div className="lg:col-span-3">
          <CompanyHistory companyStandings={companyStandings} />
        </div>
      </div>
      <StudentScoresTable
        students={students}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />
    </div>
  )
}
