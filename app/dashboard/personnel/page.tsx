/**
 * /dashboard/personnel — Placeholder for the personnel role.
 *
 * The exported page function is synchronous (no runtime data at the top level),
 * which means it prerenders into the static shell. The session read is pushed
 * into <PersonnelDashboardContent> and streamed in behind a <Suspense> boundary.
 */
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardCard from '@/app/components/DashboardCard'

// ---------------------------------------------------------------------------
// Inner async component — reads cookies, lives inside <Suspense>
// ---------------------------------------------------------------------------

async function PersonnelDashboardContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name ?? user.email ?? 'Personnel'
  const role = profile?.role ?? 'personnel'

  return (
    <DashboardCard
      name={name}
      role={role}
      description="This is the personnel operations dashboard. You can view assigned tasks, service schedules, and operational reports relevant to your department."
      badgeClass="bg-sky-500/20 text-sky-300 ring-sky-500/30"
    />
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
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

export default function PersonnelDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PersonnelDashboardContent />
    </Suspense>
  )
}
