"use client"

import { useState, useEffect } from "react"
import { StudentSelector } from "@/components/student-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, AlertCircle, FileText } from "lucide-react"
import { getStudentById, type Student } from "@/lib/data"
import { useUserRole } from "@/lib/auth"

export default function FinancialOverviewPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1")
  const [student, setStudent] = useState<Student | null>(null)
  const userRole = useUserRole()

  useEffect(() => {
    const fetchedStudent = getStudentById(selectedStudentId)
    if (fetchedStudent) {
      setStudent(fetchedStudent)
    }
  }, [selectedStudentId])

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId)
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-900">Financial Overview</h1>
          <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total financial aid
  const totalFinancialAid = student.financialStanding.financialAid.reduce((total, aid) => total + aid.amount, 0)
  
  // Calculate payment percentage
  const paymentPercentage = (student.financialStanding.tuitionPaid / student.financialStanding.tuitionTotal) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Financial Overview</h1>
          <p className="text-muted-foreground">View and manage financial information</p>
        </div>
        <StudentSelector selectedStudentId={selectedStudentId} onStudentChange={handleStudentChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1">
          <Card className="shadow-card border border-border/60 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-border/60">
              <CardTitle className="text-emerald-700">Account Summary</CardTitle>
              <CardDescription>
                {student.name} - {student.studentId}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-5">
                <div className={`p-5 rounded-lg border ${student.financialStanding.accountBalance > 0 ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p
                    className={`text-2xl font-bold ${student.financialStanding.accountBalance > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    ${student.financialStanding.accountBalance.toFixed(2)}
                  </p>
                  {student.financialStanding.accountBalance > 0 && (
                    <div className="flex items-center mt-2 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Payment due by September 30, 2023
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Tuition Progress</p>
                    <p className="text-sm text-muted-foreground">
                      ${student.financialStanding.tuitionPaid.toFixed(2)} / ${student.financialStanding.tuitionTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="progress-container">
                    <div
                      className="progress-bar progress-bar-green"
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(paymentPercentage)}% paid
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <div className="stat-label">Financial Aid</div>
                    <div className="stat-value text-emerald-600">${totalFinancialAid.toFixed(2)}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Payment Plan</div>
                    <Badge variant="outline" className="badge-info mt-1">
                      Semester
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Make a Payment
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    <FileText className="mr-2 h-4 w-4" />
                    View Payment Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-card border border-border/60 overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-border/60">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-emerald-700">Tuition & Fees Breakdown</CardTitle>
                  <CardDescription>Fall 2023 Semester</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">Tuition (Full-time)</p>
                      <p className="text-sm text-muted-foreground">15 credit hours at $600 per credit</p>
                    </div>
                    <p className="font-medium">$9,000.00</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">Student Activity Fee</p>
                      <p className="text-sm text-muted-foreground">Required for all students</p>
                    </div>
                    <p className="font-medium">$250.00</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">Technology Fee</p>
                      <p className="text-sm text-muted-foreground">Campus technology services</p>
                    </div>
                    <p className="font-medium">$350.00</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">Health Services Fee</p>
                      <p className="text-sm text-muted-foreground">Campus health center access</p>
                    </div>
                    <p className="font-medium">$200.00</p>
                  </div>
                </div>
                <div className="p-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">Campus Ministry Fee</p>
                      <p className="text-sm text-muted-foreground">Spiritual development programs</p>
                    </div>
                    <p className="font-medium">$200.00</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50/50">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-emerald-800">Total Charges</p>
                    <p className="font-bold text-emerald-800">$10,000.00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card border border-border/60 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-border/60 pb-3">
                <CardTitle className="text-emerald-700">Financial Aid</CardTitle>
                <CardDescription>Scholarships, grants, and loans</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {student.financialStanding.financialAid.map((aid) => (
                    <div key={aid.id} className="p-4 border border-border rounded-md hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-primary-900">{aid.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{aid.type}</p>
                        </div>
                        <p className="font-medium text-emerald-600">${aid.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border border-border/60 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-border/60 pb-3">
                <CardTitle className="text-emerald-700">Payment History</CardTitle>
                <CardDescription>Recent transactions and payments</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {student.financialStanding.transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border border-border rounded-md hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-primary-900">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                        <p className={`font-medium ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
