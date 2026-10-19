// Small helpers shared by the request pages

// Supabase returns a joined table as an object or a one-item array; this handles both
export function relName(rel: unknown, key = 'name'): string {
    const item = Array.isArray(rel) ? rel[0] : rel
    return (item as Record<string, string> | null | undefined)?.[key] ?? '—'
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}