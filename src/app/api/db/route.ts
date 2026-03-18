import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nsogcsmriufjcymlmatz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb2djc21yaXVmamN5bWxtYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjgwMzUsImV4cCI6MjA4OTM0NDAzNX0.mrZwfKxmHv81SXd3Mc2TCaCeGZZVBACL2X-21nfuwEs'
)

const TABLES = ['riads', 'prestataires', 'estimation', 'rdvs', 'proprietaires']

export async function GET() {
  try {
    const [riadsRes, prestaRes, estRes, rdvsRes, proprioRes] = await Promise.all([
      supabase.from('riads').select('id, data').order('id'),
      supabase.from('prestataires').select('id, data').order('id'),
      supabase.from('estimation').select('data').eq('id', 1).maybeSingle(),
      supabase.from('rdvs').select('id, data').order('id'),
      supabase.from('proprietaires').select('id, data').order('id'),
    ])
    return NextResponse.json({
      riads: (riadsRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      prestataires: (prestaRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      estimation: estRes.data?.data ?? null,
      rdvs: (rdvsRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      proprietaires: (proprioRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
    })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const { action, table, id, data } = await req.json()
    if (!TABLES.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    if (action === 'upsert') {
      const { error } = await (supabase.from(table) as any).upsert({ id, data }, { onConflict: 'id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }
    if (action === 'delete') {
      await supabase.from(table).delete().eq('id', id)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
