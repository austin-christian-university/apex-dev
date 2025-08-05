#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Load environment variables - handle both naming conventions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyData() {
  console.log('🔍 Verifying dummy data...\n')
  
  try {
    // Check companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return
    }
    
    console.log(`🏢 Companies found: ${companies?.length || 0}`)
    companies?.forEach(company => {
      console.log(`  - ${company.name}`)
    })
    
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'student')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    console.log(`\n👥 Students found: ${users?.length || 0}`)
    users?.slice(0, 5).forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`)
    })
    
    if (users && users.length > 5) {
      console.log(`  ... and ${users.length - 5} more students`)
    }
    
    // Check students with company info
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        academic_role,
        company_role,
        student_id,
        companies(name)
      `)
    
    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return
    }
    
    console.log(`\n📚 Student records found: ${students?.length || 0}`)
    
    // Group students by company
    const studentsByCompany = students?.reduce((acc, student) => {
      const companyName = student.companies?.name || 'Unknown'
      if (!acc[companyName]) {
        acc[companyName] = []
      }
      acc[companyName].push(student)
      return acc
    }, {} as Record<string, typeof students>)
    
    if (studentsByCompany) {
      Object.entries(studentsByCompany).forEach(([companyName, companyStudents]) => {
        console.log(`  ${companyName}: ${companyStudents?.length || 0} students`)
      })
    }
    
    console.log('\n✅ Verification completed!')
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
  }
}

verifyData() 