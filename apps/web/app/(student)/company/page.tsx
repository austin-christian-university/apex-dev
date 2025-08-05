import { getCurrentUserCompany } from '@/lib/company'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompanyPageClient from './company-page-client'

export default async function CompanyPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user's company details
  const { companyDetails, error } = await getCurrentUserCompany(user.id, supabase)
  
  if (error) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Information</h1>
          <p className="text-red-500 mb-4">Error loading company information: {error}</p>
          <p className="text-sm text-muted-foreground">
            Please contact support if this issue persists.
          </p>
        </div>
      </div>
    )
  }

  if (!companyDetails) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Information</h1>
          <p className="text-muted-foreground">
            You are not currently assigned to a company. Please contact an administrator.
          </p>
        </div>
      </div>
    )
  }

  return <CompanyPageClient companyDetails={companyDetails} />
} 