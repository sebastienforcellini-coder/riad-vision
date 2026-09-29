import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Clé service_role côté serveur uniquement (jamais exposée au client).
// L'accès à cette route est protégé par le middleware (cookie de session bêta).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TABLES = ['riads', 'prestataires', 'estimation', 'rdvs', 'proprietaires']

export async function GET() {
  try {
    const [riadsRes, prestaRes, estRes, rdvsRes, proprioRes, marcheRes] = await Promise.all([
      supabase.from('riads').select('id, data').order('id'),
      supabase.from('prestataires').select('id, data').order('id'),
      supabase.from('estimation').select('data').eq('id', 1).maybeSingle(),
      supabase.from('rdvs').select('id, data').order('id'),
      supabase.from('proprietaires').select('id, data').order('id'),
      supabase.from('estimation').select('data').eq('id', 2).maybeSingle(),
    ])
    return NextResponse.json({
      riads: (riadsRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      prestataires: (prestaRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      estimation: estRes.data?.data ?? null,
      rdvs: (rdvsRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      proprietaires: (proprioRes.data || []).map((r: any) => ({ ...r.data, id: r.id })),
      marchePrix: marcheRes?.data?.data ?? null,
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
