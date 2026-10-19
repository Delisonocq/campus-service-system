import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/app/components/StatusBadge'
import { formatDate, relName } from '@/lib/helpers'

type Props = { params: Promise<{ id: string }> }

export default async function RequestDetailPage({ params }: Props) {
    const { id } = await params

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Row Level Security only returns the request if this user may see it
    const { data: request } = await supabase
        .from('requests')
        .select('id, title, description, status, created_at, completed_at, service_categories(name)')
        .eq('id', id)
        .single()

    if (!request) notFound()

    const { data: updates } = await supabase
        .from('request_updates')
        .select('id, comment, new_status, created_at, profiles(full_name)')
        .eq('request_id', id)
        .order('created_at', { ascending: true })

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
            <Link href="/requests" className="text-sm text-slate-400 hover:text-white">
                ← Back to my requests
            </Link>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h1 className="text-xl font-bold text-white">{request.title}</h1>
                    <StatusBadge status={request.status} />
                </div>
                <dl className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-slate-500">Category</dt>
                        <dd className="text-slate-200">{relName(request.service_categories)}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Submitted</dt>
                        <dd className="text-slate-200">{formatDate(request.created_at)}</dd>
                    </div>
                    {request.completed_at && (
                        <div>
                            <dt className="text-slate-500">Completed</dt>
                            <dd className="text-slate-200">{formatDate(request.completed_at)}</dd>
                        </div>
                    )}
                </dl>
                <p className="whitespace-pre-wrap text-slate-300">{request.description}</p>
            </div>

            <h2 className="mb-3 mt-8 text-lg font-semibold text-white">Timeline</h2>
            <ol className="space-y-3">
                {(updates ?? []).length === 0 && (
                    <li className="text-sm text-slate-400">No updates yet.</li>
                )}
                {(updates ?? []).map((u) => (
                    <li key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-slate-300">{relName(u.profiles, 'full_name')}</span>
                            <span className="text-slate-500">{formatDate(u.created_at)}</span>
                        </div>
                        {u.new_status && (
                            <div className="mb-1">
                                <StatusBadge status={u.new_status} />
                            </div>
                        )}
                        {u.comment && <p className="text-sm text-slate-300">{u.comment}</p>}
                    </li>
                ))}
            </ol>
        </div>
    )
}