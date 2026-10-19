import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge, { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'
import { formatDate, relName } from '@/lib/helpers'

export default async function UserDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('requests')
    .select('id, title, status, created_at, service_categories(name)')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  const all = requests ?? []
  const count = (s: string) => all.filter((r) => r.status === s).length

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {profile?.full_name ?? 'there'}
          </h1>
          <p className="text-sm text-slate-400">Your campus service requests at a glance.</p>
        </div>
        <Link
          href="/requests/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New request
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/requests?status=${s}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
          >
            <p className="text-2xl font-bold text-white">{count(s)}</p>
            <p className="text-xs text-slate-400">{STATUS_LABELS[s]}</p>
          </Link>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent requests</h2>
        <Link href="/requests" className="text-sm text-indigo-300 hover:underline">
          View all
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        {all.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            You have no requests yet. Click “New request” to submit one.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody>
              {all.slice(0, 5).map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/requests/${r.id}`} className="text-indigo-300 hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{relName(r.service_categories)}</td>
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