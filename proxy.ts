/**
 * proxy.ts — Next.js 16 Proxy (formerly middleware.ts).
 *
 * Responsibilities:
 *   1. Refresh the Supabase session on every request so the auth cookie
 *      never silently expires mid-session.
 *   2. Redirect unauthenticated users who attempt to reach a protected route
 *      back to /login.
 *   3. Redirect authenticated users away from /login and /register to /dashboard
 *      so they don't see the auth forms after signing in.
 *
 * IMPORTANT: The Proxy runs on the Edge before your route renders, so we must
 * use createServerClient directly here — we cannot use the helper in
 * lib/supabase/server.ts because that awaits cookies() from 'next/headers',
 * which isn't available in the Proxy runtime. Instead we wire cookies manually.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Build a mutable response so we can forward refreshed auth cookies downstream
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to the request so the route handler also sees the new cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Rebuild the response to carry the Set-Cookie headers to the browser
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do NOT run other logic between createServerClient and
  // getUser(). The session refresh must not be interrupted.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define which paths require a valid session
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/dashboard/admin') ||
    pathname.startsWith('/dashboard/user') ||
    pathname.startsWith('/dashboard/personnel')

  // Unauthenticated user hitting a protected route → send to /login
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user hitting /login or /register → send to /dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Return the (potentially updated) response so refreshed cookies are sent
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run the Proxy on all routes except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (meta files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
