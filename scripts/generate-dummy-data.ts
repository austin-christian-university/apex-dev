#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import type { User, Student, Company } from '@acu-apex/types'
import * as dotenv from 'dotenv'

// Load environment variables from .env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

// Load environment variables - handle both naming conventions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
  console.error('\n💡 Make sure you have a .env file with your Supabase credentials.')
  console.error('   You can copy from env.template and fill in your values.')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample company data
const sampleCompanies: Omit<Company, 'id' | 'created_at'>[] = [
  {
    name: 'Alpha Company',
    description: 'Leading innovation in technology and leadership development',
    motto: 'Excellence through Innovation',
    vision: 'To develop the next generation of leaders',
    quote: 'The best way to predict the future is to create it.',
    is_active: true
  },
  {
    name: 'Bravo Company',
    description: 'Fostering teamwork and strategic thinking',
    motto: 'Strength in Unity',
    vision: 'Building cohesive teams that achieve extraordinary results',
    quote: 'Alone we can do so little; together we can do so much.',
    is_active: true
  },
  {
    name: 'Charlie Company',
    description: 'Excellence in academic and professional development',
    motto: 'Knowledge is Power',
    vision: 'Empowering students through knowledge and experience',
    quote: 'Education is the most powerful weapon which you can use to change the world.',
    is_active: true
  },
  {
    name: 'Delta Company',
    description: 'Building character and leadership skills',
    motto: 'Character Counts',
    vision: 'Developing leaders of character and integrity',
    quote: 'Leadership is not about being in charge. It is about taking care of those in your charge.',
    is_active: true
  },
  {
    name: 'Echo Company',
    description: 'Innovation and creative problem solving',
    motto: 'Think Different',
    vision: 'Creating innovative solutions to complex challenges',
    quote: 'Innovation distinguishes between a leader and a follower.',
    is_active: true
  }
]

// Generate random student data
function generateStudentData(): { user: Omit<User, 'created_at' | 'updated_at'>; student: Omit<Student, 'id' | 'created_at' | 'updated_at'> } {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName, provider: 'acu.edu' })
  
  const academicRoles = ['Freshman', 'Sophomore', 'Junior', 'Senior']
  const companyRoles = ['Member', 'Team Lead', 'Project Manager', 'Coordinator']
  
  return {
    user: {
      id: '', // Will be set after auth user creation
      role: 'student' as const,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: faker.phone.number(), // Updated to use new API
      disc_profile: faker.helpers.arrayElement(['D', 'I', 'S', 'C']),
      myers_briggs_profile: faker.helpers.arrayElement(['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']),
      enneagram_profile: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6', '7', '8', '9']),
      has_completed_onboarding: true,
      date_of_birth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString().split('T')[0],
      photo: null,
    },
    student: {
      company_id: '', // Will be set when assigning to companies
      academic_role: faker.helpers.arrayElement(academicRoles),
      company_role: faker.helpers.arrayElement(companyRoles),
      academic_year_start: 2024,
      academic_year_end: 2025,
      student_id: faker.number.int({ min: 100000, max: 999999 })
    }
  }
}

async function checkExistingData(): Promise<{ companies: number; students: number }> {
  try {
    console.log('🔍 Checking existing data...')
    const { count: companies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    const { count: students } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
    
    return {
      companies: companies || 0,
      students: students || 0
    }
  } catch (error) {
    console.error('Error checking existing data:', error)
    return { companies: 0, students: 0 }
  }
}

async function createCompanies(): Promise<Company[]> {
  console.log('🏢 Creating companies...')
  
  const companies: Company[] = []
  
  for (const companyData of sampleCompanies) {
    try {
      // Check if company already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('name', companyData.name)
        .single()
      
      if (existingCompany) {
        console.log(`⏭️  Company already exists: ${companyData.name}`)
        companies.push(existingCompany)
        continue
      }
      
      const { data: company, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single()
      
      if (error) {
        console.error(`Error creating company ${companyData.name}:`, error)
        continue
      }
      
      companies.push(company)
      console.log(`✅ Created company: ${company.name}`)
    } catch (error) {
      console.error(`Error processing company ${companyData.name}:`, error)
    }
  }
  
  return companies
}

async function createStudents(companies: Company[]): Promise<void> {
  console.log('\n👥 Creating students...')
  
  const studentsPerCompany = Math.ceil(20 / companies.length)
  let studentCount = 0
  
  for (const company of companies) {
    const companyStudents = Math.min(studentsPerCompany, 20 - studentCount)
    
    for (let i = 0; i < companyStudents && studentCount < 20; i++) {
      const studentData = generateStudentData()
      studentData.student.company_id = company.id
      
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', studentData.user.email)
          .single()
        
        if (existingUser) {
          console.log(`⏭️  User already exists: ${studentData.user.email}`)
          studentCount++
          continue
        }
        
        // Create auth user first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: studentData.user.email,
          password: 'password123', // Default password for test users
          email_confirm: true,
          user_metadata: {
            first_name: studentData.user.first_name,
            last_name: studentData.user.last_name,
            role: studentData.user.role
          }
        })
        
        if (authError) {
          console.error(`Error creating auth user ${studentData.user.email}:`, authError)
          continue
        }
        
        if (!authUser.user) {
          console.error(`No user returned for ${studentData.user.email}`)
          continue
        }
        
        // Now create the user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            role: studentData.user.role,
            first_name: studentData.user.first_name,
            last_name: studentData.user.last_name,
            email: studentData.user.email,
            phone_number: studentData.user.phone_number,
            disc_profile: studentData.user.disc_profile,
            myers_briggs_profile: studentData.user.myers_briggs_profile,
            enneagram_profile: studentData.user.enneagram_profile,
            has_completed_onboarding: studentData.user.has_completed_onboarding,
            date_of_birth: studentData.user.date_of_birth,
            photo: studentData.user.photo
          })
        
        if (userError) {
          console.error(`Error creating user profile for ${studentData.user.email}:`, userError)
          // Clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authUser.user.id)
          continue
        }
        
        // Then create the student record
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id: authUser.user.id,
            company_id: studentData.student.company_id,
            academic_role: studentData.student.academic_role,
            company_role: studentData.student.company_role,
            academic_year_start: studentData.student.academic_year_start,
            academic_year_end: studentData.student.academic_year_end,
            student_id: studentData.student.student_id
          })
        
        if (studentError) {
          console.error(`Error creating student record for ${studentData.user.email}:`, studentError)
          // Clean up the user if student creation fails
          await supabase.from('users').delete().eq('id', authUser.user.id)
          await supabase.auth.admin.deleteUser(authUser.user.id)
          continue
        }
        
        studentCount++
        console.log(`✅ Created student ${studentCount}/20: ${studentData.user.first_name} ${studentData.user.last_name} (${studentData.user.email}) - ${company.name}`)
        
      } catch (error) {
        console.error(`Error creating student ${studentData.user.email}:`, error)
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting dummy data generation...\n')
  
  try {
    // Check existing data
    const existing = await checkExistingData()
    console.log(`📊 Existing data: ${existing.companies} companies, ${existing.students} students`)
    
    // Create companies first
    const companies = await createCompanies()
    
    if (companies.length === 0) {
      console.error('❌ No companies were created. Exiting.')
      process.exit(1)
    }
    
    // Create students and assign them to companies
    await createStudents(companies)
    
    console.log('\n🎉 Dummy data generation completed!')
    console.log(`📊 Created ${companies.length} companies and 20 students`)
    
    // Display summary
    console.log('\n📋 Summary:')
    for (const company of companies) {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('company_id', company.id)
      
      console.log(`  ${company.name}: ${students?.length || 0} students`)
    }
    
  } catch (error) {
    console.error('❌ Error during dummy data generation:', error)
    process.exit(1)
  }
}

// Run the script
main() 