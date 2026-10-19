/**
 * Server-side Supabase client helper.
 *
 * Uses @supabase/ssr's createServerClient so that it can read and write the
 * auth cookies that Next.js manages on the server (Server Components, Server
 * Actions, Route Handlers, and the Proxy).
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // cookies() is async in Next.js 16 – await it before passing to createServerClient
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies so Supabase can verify the current session
        getAll() {
          return cookieStore.getAll()
        },
        // Write cookies back so the refreshed session is persisted
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll may be called from a Server Component where cookies are
            // read-only – the Proxy will keep the session alive in that case.
          }
        },
      },
    },
  )
}
