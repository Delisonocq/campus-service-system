/**
 * /dashboard — Role-based redirect hub.
 *
 * The exported page is a synchronous prerenderable shell. The actual session
 * read + role lookup + redirect is pushed into <DashboardRedirect> which
 * streams in behind a <Suspense> boundary — the correct Next.js 16 pattern
 * for reading cookies without blocking prerendering.
 *
 * Role mapping:
 *   student | academic_staff         → /dashboard/user
 *   admin_staff | dept_head | admin  → /dashboard/admin
 *   personnel                        → /dashboard/personnel
 */
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Roles that map to the admin dashboard
const ADMIN_ROLES = ['admin_staff', 'dept_head', 'admin'] as const

// ---------------------------------------------------------------------------
// Inner async component — reads cookies and issues the redirect
// ---------------------------------------------------------------------------

async function DashboardRedirect() {
  const supabase = await createClient()

  // Verify the session (Proxy already ensures auth, but we verify defensively)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile to get the role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as string | undefined

  // Redirect based on role
  if (role === 'personnel') {
    redirect('/dashboard/personnel')
  }

  if (role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    redirect('/dashboard/admin')
  }

  // student, academic_staff, or unknown — default to /dashboard/user
  redirect('/dashboard/user')
}

// ---------------------------------------------------------------------------
// Loading state — visible for the brief moment before the redirect fires
// ---------------------------------------------------------------------------

function RedirectingSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
        <p className="text-sm">Redirecting…</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export — synchronous shell, no runtime data at the top level
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <Suspense fallback={<RedirectingSpinner />}>
      <DashboardRedirect />
    </Suspense>
  )
}
