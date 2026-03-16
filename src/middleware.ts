import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'rvp_auth'
const PASSWORD = process.env.BETA_PASSWORD ?? 'riad2025'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the login page and its POST action through
  if (pathname === '/login') return NextResponse.next()

  // Check auth cookie
  const cookie = request.cookies.get(COOKIE_NAME)
  if (cookie?.value === PASSWORD) return NextResponse.next()

  // Redirect to login, preserving destination
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
