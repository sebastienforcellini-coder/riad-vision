import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nsogcsmriufjcymlmatz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zb2djc21yaXVmamN5bWxtYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjgwMzUsImV4cCI6MjA4OTM0NDAzNX0.mrZwfKxmHv81SXd3Mc2TCaCeGZZVBACL2X-21nfuwEs'
)

export async function GET() {
  try {
    const [riadsRes, prestaRes, estRes] = await Promise.all([
      supabase.from('riads').select('id, data').order('id'),
      supabase.from('prestataires').select('id, data').order('id'),
      supabase.from('estimation').select('data').eq('id', 1).maybeSingle(),
    ])
    return NextResponse.json({
      riads: (riadsRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      prestataires: (prestaRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      estimation: estRes.data?.data ?? null,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, table, id, data } = await req.json()
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
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
