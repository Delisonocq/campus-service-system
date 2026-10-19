/**
 * /dashboard/admin — Placeholder for admin_staff, dept_head, and admin roles.
 *
 * The exported page function is synchronous (no runtime data at the top level),
 * which means it prerenders into the static shell. The session read is pushed
 * into <AdminDashboardContent> and streamed in behind a <Suspense> boundary.
 */
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardCard from '@/app/components/DashboardCard'

// ---------------------------------------------------------------------------
// Inner async component — reads cookies, lives inside <Suspense>
// ---------------------------------------------------------------------------

async function AdminDashboardContent() {
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

  const name = profile?.full_name ?? user.email ?? 'Admin'
  const role = profile?.role ?? 'admin'

  return (
    <DashboardCard
      name={name}
      role={role}
      description="Welcome to the administration panel. You can manage service requests, user accounts, department settings, and system-wide configuration from this dashboard."
      badgeClass="bg-amber-500/20 text-amber-300 ring-amber-500/30"
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  )
}
