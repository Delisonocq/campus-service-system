// Coloured badge for a request status, plus shared status lists

export const STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed']

export const STATUS_LABELS: Record<string, string> = {
    submitted: 'Submitted',
    assigned: 'Assigned',
    in_progress: 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
}

const STYLES: Record<string, string> = {
    submitted: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    assigned: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    in_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    closed: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export default function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? STYLES.closed
                }`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    )
}