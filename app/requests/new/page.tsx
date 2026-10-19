import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewRequestForm from './NewRequestForm'

export default async function NewRequestPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: categories } = await supabase
        .from('service_categories')
        .select('id, name')
        .order('name')

    return (
        <div className="mx-auto w-full max-w-xl px-4 py-10">
            <h1 className="mb-1 text-2xl font-bold text-white">New service request</h1>
            <p className="mb-6 text-sm text-slate-400">
                Tell us what you need and track its progress after submitting.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <NewRequestForm categories={categories ?? []} />
            </div>
        </div>
    )
}