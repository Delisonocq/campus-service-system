'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { STATUSES, STATUS_LABELS } from '@/app/components/StatusBadge'
import { STAFF_ROLES } from '@/lib/helpers'

export type ManageState = { error?: string; success?: string }

// Server action: staff assign/update requests; personnel update their own assigned ones
export async function updateRequest(
    _prev: ManageState,
    formData: FormData
): Promise<ManageState> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in.' }

    const requestId = String(formData.get('request_id') ?? '')
    const status = String(formData.get('status') ?? '')
    const assigneeInput = String(formData.get('assigned_to') ?? '')
    const comment = String(formData.get('comment') ?? '').trim()

    if (!STATUSES.includes(status)) return { error: 'Choose a valid status.' }

    // Who is acting?
    const { data: me } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
    const isStaff = !!me?.role && STAFF_ROLES.includes(me.role)

    // The request as it is now
    const { data: current } = await supabase
        .from('requests')
        .select('id, title, status, requester_id, assigned_to, completed_at')
        .eq('id', requestId)
        .single()
    if (!current) return { error: 'Request not found.' }

    // Staff, or the person it is assigned to, may update it
    if (!isStaff && current.assigned_to !== user.id) {
        return { error: 'You are not allowed to update this request.' }
    }

    // Only staff may change who it is assigned to
    let newAssignee: string | null = current.assigned_to
    if (isStaff) newAssignee = assigneeInput || null

    // Assigning a brand-new request moves it to "assigned" automatically
    let newStatus = status
    if (
        isStaff &&
        newAssignee &&
        newAssignee !== current.assigned_to &&
        status === 'submitted'
    ) {
        newStatus = 'assigned'
    }

    const statusChanged = newStatus !== current.status
    const assigneeChanged = newAssignee !== current.assigned_to
    if (!statusChanged && !assigneeChanged && !comment) {
        return { error: 'Nothing to update. Change the status or assignee, or add a comment.' }
    }

    // Save the change on the request
    const now = new Date().toISOString()
    const done = newStatus === 'resolved' || newStatus === 'closed'
    const { error: updateError } = await supabase
        .from('requests')
        .update({
            status: newStatus,
            assigned_to: newAssignee,
            updated_at: now,
            completed_at: done ? current.completed_at ?? now : null,
        })
        .eq('id', requestId)
    if (updateError) return { error: 'Could not update the request. Please try again.' }

    // Build the timeline note
    let note = comment
    if (assigneeChanged) {
        let name = 'nobody'
        if (newAssignee) {
            const { data: person } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newAssignee)
                .single()
            name = person?.full_name ?? 'personnel'
        }
        note = `Assigned to ${name}.${comment ? ' ' + comment : ''}`
    }

    await supabase.from('request_updates').insert({
        request_id: requestId,
        author_id: user.id,
        comment: note || null,
        new_status: statusChanged ? newStatus : null,
    })

    // Notification records (shown on a notifications screen later)
    const notifications: {
        user_id: string
        request_id: string
        message: string
    }[] = []

    if (statusChanged || comment) {
        notifications.push({
            user_id: current.requester_id,
            request_id: requestId,
            message: statusChanged
                ? `Your request "${current.title}" is now ${STATUS_LABELS[newStatus]}.`
                : `New comment on your request "${current.title}".`,
        })
    }
    if (assigneeChanged && newAssignee) {
        notifications.push({
            user_id: newAssignee,
            request_id: requestId,
            message: `You have been assigned: "${current.title}".`,
        })
    }
    const toSend = notifications.filter((n) => n.user_id !== user.id)
    if (toSend.length > 0) await supabase.from('notifications').insert(toSend)

    revalidatePath(`/requests/${requestId}`)
    return { success: 'Request updated.' }
}