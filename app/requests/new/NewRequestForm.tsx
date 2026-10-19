'use client'

import { useActionState } from 'react'
import { createRequest, type FormState } from '../actions'

type Category = { id: number; name: string }

export default function NewRequestForm({ categories }: { categories: Category[] }) {
    const [state, formAction, pending] = useActionState<FormState, FormData>(
        createRequest,
        {}
    )

    const field =
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-indigo-400'

    return (
        <form action={formAction} className="space-y-5">
            {state.error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {state.error}
                </p>
            )}

            <div>
                <label className="mb-1 block text-sm text-slate-300">Service category</label>
                <select name="category_id" defaultValue="" className={field}>
                    <option value="" disabled>
                        Select a category…
                    </option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900">
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-sm text-slate-300">Title</label>
                <input name="title" type="text" placeholder="Short summary" className={field} />
            </div>

            <div>
                <label className="mb-1 block text-sm text-slate-300">Description</label>
                <textarea
                    name="description"
                    rows={5}
                    placeholder="Give the details of your request"
                    className={field}
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
                {pending ? 'Submitting…' : 'Submit request'}
            </button>
        </form>
    )
}