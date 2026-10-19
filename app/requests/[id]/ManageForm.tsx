'use client'

import { useActionState } from 'react'
import { updateRequest, type ManageState } from '../manage-actions'
import { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'

type Person = { id: string; full_name: string | null }

type Props = {
    requestId: string
    currentStatus: string
    currentAssignee: string | null
    canAssign: boolean
    personnel: Person[]
}

// Update form shown to staff (can assign) and to the assigned personnel
export default function ManageForm({
    requestId,
    currentStatus,
    currentAssignee,
    canAssign,
    personnel,
}: Props) {
    const [state, formAction, pending] = useActionState<ManageState, FormData>(
        updateRequest,
        {}
    )

    const field =
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-indigo-400'

    return (
        <form
            key={`${currentStatus}-${currentAssignee}`}
            action={formAction}
            className="space-y-4"
        >
            <input type="hidden" name="request_id" value={requestId} />

            {state.error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {state.error}
                </p>
            )}
            {state.success && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    {state.success}
                </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm text-slate-300">Status</label>
                    <select name="status" defaultValue={currentStatus} className={field}>
                        {STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-slate-900">
                                {STATUS_LABELS[s]}
                            </option>
                        ))}
                    </select>
                </div>

                {canAssign && (
                    <div>
                        <label className="mb-1 block text-sm text-slate-300">Assign to</label>
                        <select
                            name="assigned_to"
                            defaultValue={currentAssignee ?? ''}
                            className={field}
                        >
                            <option value="" className="bg-slate-900">
                                Unassigned
                            </option>
                            {personnel.map((p) => (
                                <option key={p.id} value={p.id} className="bg-slate-900">
                                    {p.full_name ?? 'Unnamed'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm text-slate-300">Comment (optional)</label>
                <textarea
                    name="comment"
                    rows={3}
                    placeholder="Add a note for the requester"
                    className={field}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
                {pending ? 'Saving…' : 'Save update'}
            </button>
        </form>
    )
}