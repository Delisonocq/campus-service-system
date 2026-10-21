import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markAllRead } from './actions'

export default async function NotificationsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Row Level Security means a user only ever receives their own notifications
    const { data } = await supabase
        .from('notifications')
        .select('id, message, is_read, created_at, request_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const notifications = data ?? []
    const unread = notifications.filter((n) => !n.is_read).length

    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    <p className="text-sm text-slate-400">{unread} unread</p>
                </div>
                {unread > 0 && (
                    <form action={markAllRead}>
                        <button
                            type="submit"
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                        >
                            Mark all as read
                        </button>
                    </form>
                )}
            </div>

            {notifications.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                    You have no notifications yet.
                </p>
            ) : (
                <ul className="space-y-3">
                    {notifications.map((n) => {
                        const content = (
                            <>
                                <p className={n.is_read ? 'text-slate-300' : 'font-medium text-white'}>
                                    {n.message}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {new Date(n.created_at).toLocaleString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </>
                        )
                        const box = `block rounded-xl border p-4 ${n.is_read
                                ? 'border-white/10 bg-white/5'
                                : 'border-indigo-500/40 bg-indigo-500/10'
                            }`
                        return (
                            <li key={n.id}>
                                {n.request_id ? (
                                    <Link href={`/requests/${n.request_id}`} className={`${box} hover:bg-white/10`}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div className={box}>{content}</div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}