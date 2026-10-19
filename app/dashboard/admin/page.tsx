import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge, { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'
import { formatDate, relName, STAFF_ROLES } from '@/lib/helpers'

type Props = { searchParams: Promise<{ status?: string }> }

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { status } = await searchParams

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

  // Only staff roles may see this page
  if (!profile || !STAFF_ROLES.includes(profile.role)) redirect('/dashboard')

  // Staff can see every request (Row Level Security allows it)
  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, title, status, created_at, assigned_to, service_categories(name), requester:profiles!requester_id(full_name), assignee:profiles!assigned_to(full_name)'
    )
    .order('created_at', { ascending: false })

  const all = requests ?? []
  const count = (s: string) => all.filter((r) => r.status === s).length
  const unassigned = all.filter((r) => !r.assigned_to && r.status !== 'closed').length
  const shown = status && STATUSES.includes(status) ? all.filter((r) => r.status === status) : all

  const tab = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active
      ? 'border-indigo-400 bg-indigo-500/20 text-white'
      : 'border-white/10 text-slate-400 hover:text-white'
    }`

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Welcome, {profile.full_name ?? 'Admin'}
        </h1>
        <p className="text-sm text-slate-400">All campus service requests.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{all.length}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/admin?status=${s}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
          >
            <p className="text-2xl font-bold text-white">{count(s)}</p>
            <p className="text-xs text-slate-400">{STATUS_LABELS[s]}</p>
          </Link>
        ))}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-2xl font-bold text-amber-300">{unassigned}</p>
          <p className="text-xs text-amber-200/80">Unassigned</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/admin" className={tab(!status)}>
          All
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/dashboard/admin?status=${s}`} className={tab(status === s)}>
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        {shown.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No requests found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Requested by</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/requests/${r.id}`} className="text-indigo-300 hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {relName(r.requester, 'full_name')}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{relName(r.service_categories)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {r.assigned_to ? relName(r.assignee, 'full_name') : 'Unassigned'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}