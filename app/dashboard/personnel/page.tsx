import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/app/components/StatusBadge'
import { formatDate, relName } from '@/lib/helpers'

export default async function PersonnelDashboardPage() {
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

  // Only the requests assigned to this person
  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, title, status, created_at, service_categories(name), requester:profiles!requester_id(full_name)'
    )
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const all = requests ?? []
  const open = all.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length
  const done = all.filter((r) => r.status === 'resolved' || r.status === 'closed').length

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Welcome, {profile?.full_name ?? 'there'}
        </h1>
        <p className="text-sm text-slate-400">Requests assigned to you.</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{all.length}</p>
          <p className="text-xs text-slate-400">Assigned to me</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{open}</p>
          <p className="text-xs text-slate-400">Open</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{done}</p>
          <p className="text-xs text-slate-400">Completed</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        {all.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            Nothing is assigned to you yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Requested by</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {all.map((r) => (
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