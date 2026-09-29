import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, authToken, getExpectedPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const expected = getExpectedPassword()
  if (!expected) {
    console.error('[auth] BETA_PASSWORD absent ou vide : accès refusé')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  try {
    const { password } = await req.json()

    if (typeof password !== 'string' || password.trim() !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, await authToken(expected), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
