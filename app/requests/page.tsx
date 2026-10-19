import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge, { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'
import { formatDate, relName } from '@/lib/helpers'

type Props = { searchParams: Promise<{ status?: string }> }

export default async function RequestsPage({ searchParams }: Props) {
    const { status } = await searchParams

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let query = supabase
        .from('requests')
        .select('id, title, status, created_at, service_categories(name)')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

    if (status && STATUSES.includes(status)) query = query.eq('status', status)

    const { data: requests } = await query

    const tab = (active: boolean) =>
        `rounded-full border px-3 py-1 text-sm ${active
            ? 'border-indigo-400 bg-indigo-500/20 text-white'
            : 'border-white/10 text-slate-400 hover:text-white'
        }`

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">My requests</h1>
                <Link
                    href="/requests/new"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    New request
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <Link href="/requests" className={tab(!status)}>
                    All
                </Link>
                {STATUSES.map((s) => (
                    <Link key={s} href={`/requests?status=${s}`} className={tab(status === s)}>
                        {STATUS_LABELS[s]}
                    </Link>
                ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                {!requests || requests.length === 0 ? (
                    <p className="p-8 text-center text-slate-400">No requests found.</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 text-slate-400">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => (
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