/**
 * DashboardCard — reusable wrapper for each role's dashboard page.
 *
 * Displays the user's name, role badge, and a sign-out button.
 * Used by all three sub-dashboards (/user, /admin, /personnel).
 */
import { signOutAction } from '@/app/actions/auth'

type Props = {
  /** Display name pulled from the profiles table */
  name: string
  /** The role string from the profiles table */
  role: string
  /** Short description shown below the role badge */
  description: string
  /** Optional accent colour class (Tailwind) for the role badge */
  badgeClass?: string
  /** Optional children rendered below the description */
  children?: React.ReactNode
}

// Map a role value to a human-readable label
const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  academic_staff: 'Academic Staff',
  admin_staff: 'Administrative Staff',
  dept_head: 'Department Head',
  admin: 'System Administrator',
  personnel: 'Personnel',
}

export default function DashboardCard({
  name,
  role,
  description,
  badgeClass = 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30',
  children,
}: Props) {
  const label = ROLE_LABELS[role] ?? role

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Hero card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {/* Avatar + greeting */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-extrabold text-white shadow-lg">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome, {name}
              </h1>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
              >
                {label}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            {description}
          </p>

          {/* Optional extra content */}
          {children && <div className="mb-6">{children}</div>}

          {/* Divider */}
          <div className="my-6 h-px bg-white/10" />

          {/* Sign-out button (Server Action form) */}
          <form action={signOutAction}>
            <button
              id="dashboard-logout-btn"
              type="submit"
              className="w-full rounded-lg bg-rose-600/80 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 active:scale-[0.98]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
