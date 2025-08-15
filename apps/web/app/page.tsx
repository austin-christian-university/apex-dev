import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Try to get user role to redirect appropriately
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, has_completed_onboarding')
        .eq('id', user.id)
        .single()

      if (!error && userData) {
        const { role, has_completed_onboarding } = userData

        // Redirect to onboarding if not completed
        if (!has_completed_onboarding) {
          redirect('/role-selection')
        }

        // Role-based redirects
        if (role === 'staff' || role === 'admin') {
          redirect('/staff')
        } else {
          redirect('/home')
        }
      }
    } catch (error) {
      console.error('Failed to fetch user role in root page:', error)
    }
    
    // Fallback to home if role fetch fails
    redirect('/home')
  } else {
    redirect('/login')
  }
} 