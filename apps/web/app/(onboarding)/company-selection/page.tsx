'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Users, Search, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@acu-apex/utils'
import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding/storage'
import { fetchCompanies } from '@/lib/onboarding/sync'
import type { Company } from '@acu-apex/types'

export default function CompanySelectionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string>('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check if user should be on this page
    const onboardingData = getOnboardingData()
    
    if (!onboardingData.role) {
      router.push('/role-selection')
      return
    }

    if (onboardingData.role === 'staff') {
      // Staff skip company selection
      router.push('/personality-assessments')
      return
    }

    if (!onboardingData.first_name || !onboardingData.last_name) {
      // Missing personal info
      router.push('/personal-info')
      return
    }

    setRole(onboardingData.role)
    setSelectedCompanyId(onboardingData.company_id || '')

    // Load companies
    loadCompanies()
  }, [router])

  useEffect(() => {
    // Filter companies based on search term
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  const loadCompanies = async () => {
    setIsLoadingCompanies(true)
    setError('')

    try {
      const result = await fetchCompanies()
      
      if (result.error) {
        setError(result.error)
        // Fallback to mock data if fetch fails
        setCompanies(getMockCompanies())
      } else {
        setCompanies(result.companies)
      }
    } catch (error) {
      console.error('Failed to load companies:', error)
      setError('Failed to load companies. Using example data.')
      setCompanies(getMockCompanies())
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  // Mock companies for development/fallback
  const getMockCompanies = (): Company[] => [
    {
      id: 'alpha',
      name: 'Alpha Company',
      description: 'Leadership and excellence through innovation',
      is_active: true
    },
    {
      id: 'beta', 
      name: 'Beta Company',
      description: 'Building tomorrow\'s leaders today',
      is_active: true
    },
    {
      id: 'gamma',
      name: 'Gamma Company', 
      description: 'Growth through collaboration and service',
      is_active: true
    },
    {
      id: 'delta',
      name: 'Delta Company',
      description: 'Dedication to academic and personal excellence',
      is_active: true
    }
  ]

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId)
  }

  const handleContinue = async () => {
    if (!selectedCompanyId) return

    setIsLoading(true)

    try {
      // Find the selected company to get its name
      const selectedCompany = companies.find(company => company.id === selectedCompanyId)
      
      // Save company selection to local storage
      saveOnboardingData({ 
        company_id: selectedCompanyId,
        company_name: selectedCompany?.name || ''
      })

      // Navigate to personality assessments
      router.push('/personality-assessments')
    } catch (error) {
      console.error('Failed to save company selection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push('/photo-upload')
  }

  if (isLoadingCompanies) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-secondary/10 rounded-full">
              <Loader2 className="h-8 w-8 text-secondary animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Loading Companies</h1>
          <p className="text-lg text-muted-foreground">
            Please wait while we fetch available companies...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-secondary/10 rounded-full">
            <Users className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Select Your Company</h1>
        <p className="text-lg text-muted-foreground">
          Choose the company you'll be joining in the ACU Apex program
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Company List */}
      <div className="space-y-3">
        {filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? 'No companies match your search.' : 'No companies available.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => {
            const isSelected = selectedCompanyId === company.id

            return (
              <Card
                key={company.id}
                className={cn(
                  "cursor-pointer border-2 transition-all hover:shadow-md",
                  isSelected 
                    ? "border-secondary bg-secondary/5" 
                    : "border-border hover:border-secondary/50"
                )}
                onClick={() => handleCompanySelect(company.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                      </div>
                    </div>
                    
                    {/* Radio button indicator */}
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected 
                        ? "border-secondary bg-secondary" 
                        : "border-muted-foreground"
                    )}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-secondary-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {company.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {company.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleGoBack}>
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!selectedCompanyId || isLoading}
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}