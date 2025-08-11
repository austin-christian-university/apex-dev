#!/usr/bin/env tsx

/**
 * Generate 5-10 dummy EVENT_SUBMISSIONS per non-Populi subcategory for a given student.
 *
 * Requirements:
 * - Each submission must include subcategory_id (FK to SUBCATEGORIES)
 * - Use aggregator-compatible shapes read by scripts/python/subcategory_aggregators.py
 * - event_id is NOT NULL and (event_id, student_id) unique → create a distinct event_instance per submission
 * - Exclude Populi-driven subcategories: spiritual_formation_grade, practicum_grade, class_attendance_grades
 */

import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CLI
const argv = process.argv.slice(2)
const studentIdx = argv.findIndex((a) => a === '--student' || a === '-s')
const countIdx = argv.findIndex((a) => a === '--count' || a === '-c')
const studentId =
  (studentIdx !== -1 ? argv[studentIdx + 1] : undefined) || '7630d221-e3aa-4126-a0e3-bee715160247'
const APPROVER_ID = '7004e0d1-ca2e-4df2-b7f4-9ce32dfabc89'
const minCount = countIdx !== -1 ? Math.max(5, Number(argv[countIdx + 1])) : 5
const maxCount = Math.max(minCount, 10)

type StudentRow = { id: string; academic_year_start: number; academic_year_end: number }

function iso(d: Date) {
  return d.toISOString()
}

function randomDateInYear(year: number): Date {
  const from = new Date(Date.UTC(year, 0, 1))
  const to = new Date(Date.UTC(year, 11, 31))
  return faker.date.between({ from, to })
}

async function getStudent(): Promise<StudentRow | null> {
  const { data, error } = await supabase
    .from('students')
    .select('id, academic_year_start, academic_year_end')
    .eq('id', studentId)
    .single()
  if (error) return null
  return data as StudentRow
}

type Subcategory = { id: string; name: string; display_name?: string | null }

async function getSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase.from('subcategories').select('id, name, display_name')
  if (error) throw error
  return data || []
}

const EXCLUDED = new Set([
  'spiritual_formation_grade',
  'practicum_grade',
  'class_attendance_grades',
])

// Map subcategory.name → generator key and options
type GenKey =
  | 'attendance'
  | 'monthly_small_group'
  | 'monthly_dream_team'
  | 'community_service'
  | 'rating_chapel'
  | 'rating_team_building'
  | 'ff_points'
  | 'gbe_participation'
  | 'credentials'
  | 'job_promotion'
  | 'lions_games'

function resolveGeneratorKey(name: string): GenKey | null {
  switch (name) {
    case 'chapel_attendance':
    case 'fellow_friday_attendance':
    case 'gbe_attendance':
    case 'company_community_events':
      return 'attendance'
    case 'small_group_involvement':
      return 'monthly_small_group'
    case 'dream_team_involvement':
      return 'monthly_dream_team'
    case 'community_service_hours':
      return 'community_service'
    case 'chapel_participation':
      return 'rating_chapel'
    case 'company_team_building':
      return 'rating_team_building'
    case 'fellow_friday_participation':
      return 'ff_points'
    case 'gbe_participation':
      return 'gbe_participation'
    case 'credentials_certifications':
      return 'credentials'
    case 'job_promotion_opportunities':
      return 'job_promotion'
    case 'lions_games_involvement':
      return 'lions_games'
    default:
      return null
  }
}

async function createEventInstance(
  eventType: 'attendance' | 'self_report',
  year: number,
  subcategory_id: string,
) {
  const { data, error } = await supabase
    .from('event_instances')
    .insert({
      name: `SEED ${eventType.toUpperCase()} ${faker.string.alphanumeric(8)}`,
      description: 'Seeded for subcategory testing',
      event_type: eventType,
      required_roles: null,
      required_years: null,
      class_code: null,
      due_date: iso(randomDateInYear(year)),
      is_active: true,
      created_by: null,
      recurring_event_id: null,
      required_company: null,
      subcategory_id,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

async function insertSubmission(
  event_id: string,
  subcategory_id: string,
  submitted_at: string,
  submission_data: Record<string, any>,
  opts?: {
    needsApproval?: boolean
    approvalStatus?: 'pending' | 'approved' | 'rejected'
    approvedBy?: string | null
    pointsGranted?: number | null
  },
) {
  const payload = {
    event_id,
    student_id: studentId,
    submitted_by: studentId,
    submission_data,
    submitted_at,
    subcategory_id,
    // Approval fields
    needs_approval: opts?.needsApproval ?? false,
    approval_status: opts?.approvalStatus ?? 'pending',
    approved_by: opts?.approvedBy ?? null,
    points_granted: opts?.pointsGranted ?? null,
  }
  const { error } = await supabase.from('event_submissions').insert(payload)
  if (error) throw error
}

async function genAttendance(student: StudentRow, subcat: Subcategory, count: number) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('attendance', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const present = Math.random() < 0.85
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type: 'attendance',
      status: present ? 'present' : 'absent',
      notes: `${subcat.name} attendance #${i + 1}`,
    })
  }
}

async function genMonthly(student: StudentRow, subcat: Subcategory, kind: 'small_group' | 'dream_team', count: number) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    // Aggregator expects status present/absent for binary monthly checks
    const involved = Math.random() < 0.8
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type: kind,
      status: involved ? 'present' : 'absent',
      notes: `${kind} monthly check #${i + 1}`,
    })
  }
}

async function genCommunityService(student: StudentRow, subcat: Subcategory, count: number) {
  const orgs = [
    'Local Food Bank',
    'Animal Shelter',
    'Community Garden',
    'Senior Center',
    'Habitat for Humanity',
  ]
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const hours = faker.number.float({ min: 0.5, max: 4, multipleOf: 0.5 })
    const submission = {
      submission_type: 'community_service',
      hours,
      organization: faker.helpers.arrayElement(orgs),
      supervisor_name: faker.person.fullName(),
      supervisor_contact: faker.internet.email(),
      description: faker.lorem.sentence(10),
      date_of_service: submitted_at.slice(0, 10),
    }
    // Community service is submitted by students and goes through approval → mark approved
    await insertSubmission(event_id, subcat.id, submitted_at, submission, {
      needsApproval: true,
      approvalStatus: 'approved',
      approvedBy: APPROVER_ID,
      pointsGranted: Number(Number(submission.hours).toFixed(1)),
    })
  }
}

async function genRating(
  student: StudentRow,
  subcat: Subcategory,
  submission_type: 'chapel_participation' | 'company_team_building',
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const rating = faker.number.float({ min: 3, max: 5, multipleOf: 0.1 })
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type,
      rating: Number(rating.toFixed(1)),
      notes: `${submission_type} #${i + 1}`,
    })
  }
}

async function genFellowFridayPoints(student: StudentRow, subcat: Subcategory, count: number) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const points = faker.number.int({ min: 1, max: 5 })
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type: 'fellow_friday',
      points,
      notes: `Fellow Friday points #${i + 1}`,
    })
  }
}

async function genGBE(student: StudentRow, subcat: Subcategory, count: number) {
  // Mix of attendance and bonus entries for the same subcategory
  const attendanceCount = Math.ceil(count * 0.6)
  const bonusCount = count - attendanceCount
  await genAttendance(student, subcat, attendanceCount)
  for (let i = 0; i < bonusCount; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const bonus_points = faker.number.int({ min: 1, max: 5 })
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type: 'gbe_participation',
      bonus_points,
      notes: `GBE bonus #${i + 1}`,
    })
  }
}

async function genCredentials(student: StudentRow, subcat: Subcategory, count: number) {
  const creds = ['AWS Cloud Practitioner', 'Google Analytics', 'Excel Specialist', 'First Aid Certification']
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const assigned_points = faker.number.int({ min: 10, max: 50 })
    const submission = {
      submission_type: 'credentials',
      credential_name: faker.helpers.arrayElement(creds),
      granting_organization: 'Professional Certification Body',
      description: faker.lorem.sentence(10),
      date_of_credential: submitted_at.slice(0, 10),
      assigned_points,
    }
    // Credentials require staff approval → approve and assign points
    await insertSubmission(event_id, subcat.id, submitted_at, submission, {
      needsApproval: true,
      approvalStatus: 'approved',
      approvedBy: APPROVER_ID,
      pointsGranted: assigned_points,
    })
  }
}

async function genJobPromotion(student: StudentRow, subcat: Subcategory, count: number) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const assigned_points = faker.number.int({ min: 20, max: 100 })
    const submission = {
      submission_type: 'job_promotion',
      promotion_title: faker.helpers.arrayElement(['Assistant → Senior Assistant', 'Team Member → Team Lead']),
      organization: 'ACU Apex',
      supervisor_name: faker.person.fullName(),
      supervisor_contact: faker.internet.email(),
      description: faker.lorem.sentence(12),
      date_of_promotion: submitted_at.slice(0, 10),
      assigned_points,
    }
    // Job promotions require staff approval → approve and assign points
    await insertSubmission(event_id, subcat.id, submitted_at, submission, {
      needsApproval: true,
      approvalStatus: 'approved',
      approvedBy: APPROVER_ID,
      pointsGranted: assigned_points,
    })
  }
}

async function genLionsGames(student: StudentRow, subcat: Subcategory, count: number) {
  for (let i = 0; i < count; i++) {
    const event_id = await createEventInstance('self_report', student.academic_year_start, subcat.id)
    const submitted_at = iso(randomDateInYear(student.academic_year_start))
    const assigned_points = faker.number.int({ min: 5, max: 30 })
    await insertSubmission(event_id, subcat.id, submitted_at, {
      submission_type: 'lions_games',
      assigned_points,
      notes: `Lions Games points #${i + 1}`,
    })
  }
}

async function main() {
  console.log('🚀 Seeding event_submissions per subcategory for student:', studentId)
  const student = await getStudent()
  if (!student) {
    console.error('❌ Student not found:', studentId)
    process.exit(1)
  }

  const subs = await getSubcategories()
  const targets = subs.filter((s) => !EXCLUDED.has(s.name))
  if (targets.length === 0) {
    console.log('No target subcategories found.')
    return
  }

  for (const sub of targets) {
    const key = resolveGeneratorKey(sub.name)
    const count = faker.number.int({ min: minCount, max: maxCount })
    if (!key) {
      console.log(`⚠️  Skipping unrecognized subcategory: ${sub.name}`)
      continue
    }

    switch (key) {
      case 'attendance':
        await genAttendance(student, sub, count)
        break
      case 'monthly_small_group':
        await genMonthly(student, sub, 'small_group', count)
        break
      case 'monthly_dream_team':
        await genMonthly(student, sub, 'dream_team', count)
        break
      case 'community_service':
        await genCommunityService(student, sub, count)
        break
      case 'rating_chapel':
        await genRating(student, sub, 'chapel_participation', count)
        break
      case 'rating_team_building':
        await genRating(student, sub, 'company_team_building', count)
        break
      case 'ff_points':
        await genFellowFridayPoints(student, sub, count)
        break
      case 'gbe_participation':
        await genGBE(student, sub, count)
        break
      case 'credentials':
        await genCredentials(student, sub, count)
        break
      case 'job_promotion':
        await genJobPromotion(student, sub, count)
        break
      case 'lions_games':
        await genLionsGames(student, sub, count)
        break
    }
    console.log(`  ✅ Seeded ${count} for ${sub.name}`)
  }

  console.log('🎉 Completed seeding for student', studentId)
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  process.exit(1)
})


