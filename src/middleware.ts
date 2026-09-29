import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, authToken, getExpectedPassword } from '@/lib/auth'

// Routes accessibles sans cookie. /api/ping est protégée par son propre CRON_SECRET.
const PUBLIC_PATHS = ['/login', '/api/auth', '/api/ping']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const expected = getExpectedPassword()
  const cookie = request.cookies.get(COOKIE_NAME)?.value

  if (expected && cookie && cookie === (await authToken(expected))) {
    return NextResponse.next()
  }

  // Les routes API répondent 401 au lieu de rediriger vers la page de connexion.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
