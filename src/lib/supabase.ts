import { createClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://nsogcsmriufjcymlmatz.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb2djc21yaXVmamN5bWxtYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjgwMzUsImV4cCI6MjA4OTM0NDAzNX0.mrZwfKxmHv81SXd3Mc2TCaCeGZZVBACL2X-21nfuwEs'
  _client = createClient(url, key)
  return _client
}
