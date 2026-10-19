'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error?: string }

// Server action: validates the form and creates a new request
export async function createRequest(
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const categoryId = Number(formData.get('category_id'))
    const title = String(formData.get('title') ?? '').trim()
    const description = String(formData.get('description') ?? '').trim()

    if (!categoryId) return { error: 'Please choose a service category.' }
    if (title.length < 5) return { error: 'Title must be at least 5 characters.' }
    if (description.length < 10)
        return { error: 'Please describe your request in at least 10 characters.' }

    const { data, error } = await supabase
        .from('requests')
        .insert({
            requester_id: user.id,
            category_id: categoryId,
            title,
            description,
            status: 'submitted',
        })
        .select('id')
        .single()

    if (error || !data) {
        return { error: 'Could not submit your request. Please try again.' }
    }

    // First entry in the request's timeline
    await supabase.from('request_updates').insert({
        request_id: data.id,
        author_id: user.id,
        comment: 'Request submitted',
        new_status: 'submitted',
    })

    redirect(`/requests/${data.id}`)
}