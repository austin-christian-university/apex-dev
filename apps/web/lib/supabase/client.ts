import { createBrowserClient } from '@supabase/ssr'
import { environment } from '@/lib/config/environment'

export function createClient() {
  return createBrowserClient(
    environment.supabase.url,
    environment.supabase.anonKey
  )
} 