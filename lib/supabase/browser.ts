/**
 * Browser (client-side) Supabase client.
 *
 * Import this in Client Components that need to talk to Supabase directly
 * (e.g. subscriptions, realtime). For server-side work use the server client.
 *
 * createBrowserClient automatically reads the cookies that the server sets,
 * so the logged-in session is available on the client without any extra work.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
