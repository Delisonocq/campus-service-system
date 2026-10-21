/**
 * / — Home / landing page.
 *
 * A simple, polished splash page that directs visitors to register or log in.
 */
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campus Service Management System',
  description:
    'A centralised platform for managing campus services, staff, and student requests.',
}

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Radial gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]"
      />

      {/* Hero text */}
      <div className="relative z-10 max-w-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-400 text-slate-900 text-4xl font-extrabold shadow-lg shadow-indigo-400/30">
          C
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Campus Service
          </span>{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        <p className="mb-10 text-lg text-slate-400">
          A centralised platform connecting students, staff, and administrators
          for seamless campus service delivery.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            id="home-register-btn"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            Get started
          </Link>
          <Link
            href="/login"
            id="home-login-btn"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {[
            'Role-based access',
            'Student portal',
            'Staff management',
            'Admin controls',
            'Personnel tracking',
          ].map((feat) => (
            <span
              key={feat}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
