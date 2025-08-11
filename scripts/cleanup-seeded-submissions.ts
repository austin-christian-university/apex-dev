#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🧹 Cleaning seeded event_instances and event_submissions...')

  // 1) Find event_instances created by our scripts
  const { data: seedInstances1, error: err1 } = await supabase
    .from('event_instances')
    .select('id')
    .ilike('name', 'SEED%')
  if (err1) throw err1

  const { data: seedInstances2, error: err2 } = await supabase
    .from('event_instances')
    .select('id')
    .ilike('name', 'APEX DUMMY -%')
  if (err2) throw err2

  const ids = [
    ...(seedInstances1?.map((r: any) => r.id) || []),
    ...(seedInstances2?.map((r: any) => r.id) || []),
  ]

  if (ids.length === 0) {
    console.log('No seeded event_instances found.')
    return
  }

  console.log(`Found ${ids.length} seeded event_instances.`)

  // 2) Delete dependent event_submissions
  const BATCH = 500
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH)
    const { error: delSubsErr } = await supabase.from('event_submissions').delete().in('event_id', chunk)
    if (delSubsErr) throw delSubsErr
  }
  console.log('Deleted linked event_submissions.')

  // 3) Delete the event_instances
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH)
    const { error: delInstErr } = await supabase.from('event_instances').delete().in('id', chunk)
    if (delInstErr) throw delInstErr
  }
  console.log('Deleted seeded event_instances.')

  console.log('✅ Cleanup complete.')
}

main().catch((e) => {
  console.error('❌ Cleanup failed:', e)
  process.exit(1)
})


