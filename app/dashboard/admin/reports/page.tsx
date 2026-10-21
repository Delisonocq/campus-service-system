import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'
import { relName, STAFF_ROLES } from '@/lib/helpers'

// Bar colour for each status (full class names so Tailwind includes them)
const BAR_COLORS: Record<string, string> = {
    submitted: 'bg-sky-500',
    assigned: 'bg-violet-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-emerald-500',
    closed: 'bg-slate-500',
}

// Turns milliseconds into a readable duration
function formatDuration(ms: number): string {
    const minutes = ms / 60000
    if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`
    const hours = minutes / 60
    if (hours < 48) return `${hours.toFixed(1)} hours`
    return `${(hours / 24).toFixed(1)} days`
}

// One horizontal bar: label, bar proportional to value, and the number
function BarRow({
    label,
    value,
    max,
    color,
}: {
    label: string
    value: number
    max: number
    color: string
}) {
    const width = max > 0 ? Math.round((value / max) * 100) : 0
    return (
        <div className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm text-slate-300">{label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-white/5">
                <div className={`h-full rounded ${color}`} style={{ width: `${width}%` }} />
            </div>
            <span className="w-8 text-right text-sm font-semibold text-white">{value}</span>
        </div>
    )
}

export default async function ReportsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Only staff roles may see reports
    if (!profile || !STAFF_ROLES.includes(profile.role)) redirect('/dashboard')

    const { data } = await supabase
        .from('requests')
        .select(
            'id, status, created_at, completed_at, assigned_to, service_categories(name), assignee:profiles!assigned_to(full_name)'
        )

    const all = data ?? []
    const total = all.length

    // --- Headline figures ---
    const completed = all.filter((r) => r.completed_at)
    const resolvedCount = all.filter(
        (r) => r.status === 'resolved' || r.status === 'closed'
    ).length
    const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0
    const unassigned = all.filter((r) => !r.assigned_to && r.status !== 'closed').length

    const avgMs =
        completed.length > 0
            ? completed.reduce(
                (sum, r) =>
                    sum + (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()),
                0
            ) / completed.length
            : 0

    // --- Requests by status ---
    const byStatus = STATUSES.map((s) => ({
        status: s,
        count: all.filter((r) => r.status === s).length,
    }))
    const maxStatus = Math.max(1, ...byStatus.map((s) => s.count))

    // --- Requests by category ---
    const categoryMap = new Map<string, number>()
    for (const r of all) {
        const name = relName(r.service_categories)
        categoryMap.set(name, (categoryMap.get(name) ?? 0) + 1)
    }
    const byCategory = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])
    const maxCategory = Math.max(1, ...byCategory.map((c) => c[1]))

    // --- Personnel workload ---
    const workMap = new Map<string, { assigned: number; completed: number }>()
    for (const r of all) {
        if (!r.assigned_to) continue
        const name = relName(r.assignee, 'full_name')
        const entry = workMap.get(name) ?? { assigned: 0, completed: 0 }
        entry.assigned += 1
        if (r.status === 'resolved' || r.status === 'closed') entry.completed += 1
        workMap.set(name, entry)
    }
    const workload = Array.from(workMap.entries()).sort((a, b) => b[1].assigned - a[1].assigned)
    const maxWork = Math.max(1, ...workload.map((w) => w[1].assigned))

    const card = 'rounded-2xl border border-white/10 bg-white/5 p-6'

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-10">
            <Link href="/dashboard/admin" className="text-sm text-slate-400 hover:text-white">
                ← Back to dashboard
            </Link>
            <h1 className="mb-1 mt-4 text-2xl font-bold text-white">Reports</h1>
            <p className="mb-6 text-sm text-slate-400">
                Summary of campus service requests across the system.
            </p>

            {/* Headline figures */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-bold text-white">{total}</p>
                    <p className="text-xs text-slate-400">Total requests</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-bold text-white">{resolutionRate}%</p>
                    <p className="text-xs text-slate-400">Resolution rate</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-2xl font-bold text-white">
                        {completed.length > 0 ? formatDuration(avgMs) : '—'}
                    </p>
                    <p className="text-xs text-slate-400">Average completion time</p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-2xl font-bold text-amber-300">{unassigned}</p>
                    <p className="text-xs text-amber-200/80">Unassigned</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className={card}>
                    <h2 className="mb-4 text-lg font-semibold text-white">Requests by status</h2>
                    <div className="space-y-3">
                        {byStatus.map((s) => (
                            <BarRow
                                key={s.status}
                                label={STATUS_LABELS[s.status]}
                                value={s.count}
                                max={maxStatus}
                                color={BAR_COLORS[s.status]}
                            />
                        ))}
                    </div>
                </div>

                <div className={card}>
                    <h2 className="mb-4 text-lg font-semibold text-white">Requests by category</h2>
                    {byCategory.length === 0 ? (
                        <p className="text-sm text-slate-400">No data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {byCategory.map(([name, count]) => (
                                <BarRow
                                    key={name}
                                    label={name}
                                    value={count}
                                    max={maxCategory}
                                    color="bg-indigo-500"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={`${card} mt-6`}>
                <h2 className="mb-4 text-lg font-semibold text-white">Personnel workload</h2>
                {workload.length === 0 ? (
                    <p className="text-sm text-slate-400">No requests have been assigned yet.</p>
                ) : (
                    <div className="space-y-4">
                        {workload.map(([name, w]) => (
                            <div key={name}>
                                <BarRow label={name} value={w.assigned} max={maxWork} color="bg-violet-500" />
                                <p className="ml-[9.75rem] mt-1 text-xs text-slate-500">
                                    {w.completed} of {w.assigned} completed
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}