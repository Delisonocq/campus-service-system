/**
 * /dashboard/user — Placeholder for students and academic staff.
 *
 * The exported page function is synchronous (no runtime data at the top level),
 * which means it prerenders into the static shell. The actual session read is
 * pushed into <UserDashboardContent> and streamed in behind a <Suspense>
 * boundary — the correct Next.js 16 / Cache-Components pattern.
 */
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardCard from '@/app/components/DashboardCard'

// ---------------------------------------------------------------------------
// Inner async component — reads cookies, lives inside <Suspense>
// ---------------------------------------------------------------------------

async function UserDashboardContent() {
  const supabase = await createClient()

  // Defensive auth check (the Proxy already guards this route)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch the profile row created by the database trigger on sign-up
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name ?? user.email ?? 'User'
  const role = profile?.role ?? 'student'

  return (
    <DashboardCard
      name={name}
      role={role}
      description="This is your personal campus services dashboard. From here you can view your service requests, track updates, and access resources available to you."
      badgeClass="bg-emerald-500/20 text-emerald-300 ring-emerald-500/30"
    />
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton — shown while the session-reading content streams in
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg animate-pulse rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/10" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-4/5 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export — synchronous, prerenderable shell
// ---------------------------------------------------------------------------

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UserDashboardContent />
    </Suspense>
  )
}
