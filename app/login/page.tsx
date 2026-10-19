/**
 * /login — Login page.
 *
 * A Client Component so we can use useActionState to show errors returned
 * from the signInAction Server Action without a full page reload.
 */
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signInAction, type AuthFormState } from '@/app/actions/auth'

const initialState: AuthFormState = undefined

export default function LoginPage() {
  const [state, action, pending] = useActionState(signInAction, initialState)

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-extrabold">
              C
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">
              Sign in to Campus Service Management
            </p>
          </div>

          {/* Error banner */}
          {state?.error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {state.error}
            </div>
          )}

          {/* Form */}
          <form action={action} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@university.edu"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
