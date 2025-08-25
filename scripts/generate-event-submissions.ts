#!/usr/bin/env tsx

/**
 * Generate dummy event submissions for existing students in Supabase.
 *
 * Purpose: Seed realistic data so the Python scoring flow can aggregate
 * subcategory raw points and run the holistic GPA pipeline.
 *
 * Notes:
 * - Uses non-routine submissions (event_id = null) to avoid needing event instances
 * - Shapes match what the Python aggregators expect (status, hours, points, rating, bonus_points)
 * - Dates fall within each student's academic_year_start
 */

import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'

// Load environment variables from .env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

type StudentRow = {
  id: string
  academic_year_start: number
  academic_year_end: number
}

type EventSubmissionRow = {
  event_id: string | null
  student_id: string
  submitted_by: string
  submission_data: Record<string, any>
  submitted_at: string
}

// CLI options (very lightweight)
const args = process.argv.slice(2)
const limitIdx = args.findIndex((a) => a === '--limit' || a === '-n')
const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : undefined

function randomDateInYear(year: number): Date {
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year, 11, 31))
  const ts = faker.date.between({ from: start, to: end }).getTime()
  return new Date(ts)
}

function iso(date: Date): string {
  return date.toISOString()
}

function pickPresentAbsent(presentRatio: number): 'present' | 'absent' {
  return Math.random() < presentRatio ? 'present' : 'absent'
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

async function fetchStudents(): Promise<StudentRow[]> {
  const query = supabase.from('students').select('id, academic_year_start, academic_year_end')
  const { data, error } = await (limit ? query.limit(limit) : query)
  if (error) throw error
  return data || []
}

async function createEventInstances(
  count: number,
  eventType: 'attendance' | 'self_report',
  year: number,
): Promise<string[]> {
  if (count <= 0) return []
  const rows = Array.from({ length: count }).map((_, i) => ({
    name: `APEX DUMMY - ${eventType.toUpperCase()} - ${i + 1} - ${faker.string.alphanumeric(6)}`,
    description: 'Dummy event for seeding submissions',
    event_type: eventType,
    required_roles: null,
    required_years: null,
    class_code: null,
    due_date: iso(randomDateInYear(year)),
    is_active: true,
    created_by: null,
    recurring_event_id: null,
    required_company: null,
  }))
  const { data, error } = await supabase
    .from('event_instances')
    .insert(rows)
    .select('id')
  if (error) throw error
  return (data || []).map((r: any) => r.id as string)
}

function buildAttendanceSubmissions(student: StudentRow, total: number, presentCount: number): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  const presentRatio = total > 0 ? presentCount / total : 0
  for (let i = 0; i < total; i++) {
    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: 'attendance',
        status: pickPresentAbsent(presentRatio),
        participation_level: 'active',
        notes: 'Dummy attendance submission',
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildMonthlyCheckSubmissions(
  student: StudentRow,
  submissionType: 'small_group' | 'dream_team',
  totalChecks: number,
  presentChecks: number,
): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  for (let i = 0; i < totalChecks; i++) {
    const submissionData: Record<string, any> = {
      submission_type: submissionType,
      status: i < presentChecks ? 'involved' : 'not_involved',
      notes: `Monthly check ${i + 1}`,
    }

    // Add group_name or team_name based on submission type
    if (submissionType === 'small_group') {
      submissionData.group_name = faker.person.fullName() + "'s Small Group"
    } else if (submissionType === 'dream_team') {
      submissionData.team_name = faker.company.name() + " Dream Team"
    }

    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: submissionData,
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildCommunityServiceSubmissions(
  student: StudentRow,
  totalTargetHours: number,
  submissionCount: number,
): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  const organizations = [
    'Local Food Bank',
    'Animal Shelter',
    'Homeless Shelter',
    'Community Garden',
    'Senior Center',
    'Habitat for Humanity',
  ]
  // distribute hours across submissions with small random jitter
  let allocated = 0
  for (let i = 0; i < submissionCount; i++) {
    const remainingSlots = submissionCount - i
    const remainingTarget = totalTargetHours - allocated
    const base = remainingTarget / remainingSlots
    const jitter = faker.number.float({ min: -0.3, max: 0.3 })
    const hoursRaw = clamp(base + jitter, 0.5, 8) // daily cap 8 hours
    const hours = i === submissionCount - 1 ? clamp(remainingTarget, 0.5, 8) : hoursRaw
    allocated += hours

    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: 'community_service',
        hours: Number(hours.toFixed(1)),
        organization: faker.helpers.arrayElement(organizations),
        supervisor_name: faker.person.fullName(),
        supervisor_contact: faker.internet.email(),
        description: faker.lorem.sentence(10),
        date_of_service: iso(randomDateInYear(student.academic_year_start)).slice(0, 10),
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildStaffPointsSubmissions(
  student: StudentRow,
  submissionType: 'credentials' | 'job_promotion',
  entries: number,
  pointsRange: { min: number; max: number },
): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  for (let i = 0; i < entries; i++) {
    const points = faker.number.int(pointsRange)
    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: submissionType,
        assigned_points: points,
        promotion_title: submissionType === 'job_promotion' ? 'Team Member → Senior Assistant' : undefined,
        credential_name: submissionType === 'credentials' ? faker.helpers.arrayElement([
          'AWS Cloud Practitioner',
          'Google Analytics',
          'Excel Specialist',
        ]) : undefined,
        granting_organization: submissionType === 'credentials' ? 'Professional Certification Body' : undefined,
        description:
          submissionType === 'credentials'
            ? `Professional certification: ${faker.lorem.words(3)}`
            : 'Promotion awarded by company officers',
        date_of_credential:
          submissionType === 'credentials'
            ? iso(randomDateInYear(student.academic_year_start)).slice(0, 10)
            : undefined,
        date_of_promotion:
          submissionType === 'job_promotion'
            ? iso(randomDateInYear(student.academic_year_start)).slice(0, 10)
            : undefined,
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildRatingSubmissions(
  student: StudentRow,
  submissionType: 'chapel_participation' | 'company_team_building',
  count: number,
  averageRating: number,
): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  for (let i = 0; i < count; i++) {
    // vary around the average within 0.5
    const rating = clamp(averageRating + faker.number.float({ min: -0.5, max: 0.5 }), 1, 5)
    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: submissionType,
        rating: Number(rating.toFixed(1)),
        notes: `${submissionType.replace('_', ' ')} #${i + 1}`,
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildFellowFridayPoints(
  student: StudentRow,
  sessions: number,
  totalPointsTarget: number,
): EventSubmissionRow[] {
  const submissions: EventSubmissionRow[] = []
  // distribute points roughly evenly
  let allocated = 0
  for (let i = 0; i < sessions; i++) {
    const remainingSlots = sessions - i
    const remainingPoints = totalPointsTarget - allocated
    const base = Math.max(10, Math.floor(remainingPoints / remainingSlots))
    const jitter = faker.number.int({ min: -10, max: 10 })
    const points = Math.max(5, base + jitter)
    allocated += points
    submissions.push({
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: 'fellow_friday',
        points,
        notes: 'Fellow Friday participation points',
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    })
  }
  return submissions
}

function buildGbeParticipation(student: StudentRow, bonusPoints: number): EventSubmissionRow[] {
  return [
    {
      event_id: null,
      student_id: student.id,
      submitted_by: student.id,
      submission_data: {
        submission_type: 'gbe_participation',
        bonus_points: bonusPoints,
        notes: 'GBE bonus points',
      },
      submitted_at: iso(randomDateInYear(student.academic_year_start)),
    },
  ]
}

async function generateForStudent(student: StudentRow) {
  // Reasonable defaults based on docs and python dummy generator
  const records: EventSubmissionRow[] = []

  // Attendance (aggregate percentage)
  records.push(...buildAttendanceSubmissions(student, 25, 22)) // chapel_attendance idea

  // Monthly checks
  records.push(...buildMonthlyCheckSubmissions(student, 'small_group', 4, 3))
  records.push(...buildMonthlyCheckSubmissions(student, 'dream_team', 4, 4))

  // Community service (cap at 12 hours across submissions)
  records.push(...buildCommunityServiceSubmissions(student, 12, 8))

  // Staff-assigned points
  records.push(...buildStaffPointsSubmissions(student, 'credentials', 2, { min: 60, max: 90 }))
  // 50% of students get a promotion entry
  if (Math.random() < 0.5) {
    records.push(...buildStaffPointsSubmissions(student, 'job_promotion', 1, { min: 80, max: 120 }))
  }

  // Ratings (participation quality)
  records.push(...buildRatingSubmissions(student, 'chapel_participation', 5, 4.2))
  records.push(...buildRatingSubmissions(student, 'company_team_building', 5, 4.3))

  // Fellow Friday participation (points-based)
  records.push(...buildFellowFridayPoints(student, 8, 360))

  // GBE participation (attendance + bonus)
  records.push(...buildGbeParticipation(student, 20))

  // Insert in batches to avoid large payloads
  const BATCH_SIZE = 200
  let inserted = 0
  // Prepare event instances for this student's submissions to satisfy (event_id, student_id) uniqueness
  const attendanceNeeded = records.filter((r) => r.submission_data?.submission_type === 'attendance').length
  const selfReportNeeded = records.length - attendanceNeeded
  const attendanceIds = await createEventInstances(attendanceNeeded, 'attendance', student.academic_year_start)
  const selfReportIds = await createEventInstances(selfReportNeeded, 'self_report', student.academic_year_start)
  let aIdx = 0
  let sIdx = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE).map((r) => {
      const isAttendance = r.submission_data?.submission_type === 'attendance'
      const event_id = isAttendance ? attendanceIds[aIdx++] : selfReportIds[sIdx++]
      return { ...r, event_id }
    })
    const { error } = await supabase.from('event_submissions').insert(batch)
    if (error) throw error
    inserted += batch.length
  }

  return inserted
}

async function main() {
  console.log('🚀 Generating dummy event submissions for existing students...')
  try {
    const students = await fetchStudents()
    if (students.length === 0) {
      console.log('No students found. Exiting.')
      process.exit(0)
    }

    console.log(`Found ${students.length} students${limit ? ` (limited to ${limit})` : ''}.`)

    let totalInserted = 0
    let processed = 0
    for (const student of students) {
      const inserted = await generateForStudent(student)
      totalInserted += inserted
      processed += 1
      console.log(`  ✅ ${processed}/${students.length} student(s) processed → ${inserted} submissions`)
    }

    console.log('\n🎉 Done!')
    console.log(`📦 Inserted ${totalInserted} event_submissions across ${students.length} student(s).`)
    console.log('You can now run the Python scoring flow to test aggregation and GPA calculation.')
  } catch (err) {
    console.error('❌ Generation failed:', err)
    process.exit(1)
  }
}

main()


