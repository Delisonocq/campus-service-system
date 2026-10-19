/**
 * /register — Registration page.
 *
 * A Client Component so we can use useActionState to show validation errors
 * returned from the signUpAction Server Action inline on the form.
 */
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUpAction, type AuthFormState } from '@/app/actions/auth'

const initialState: AuthFormState = undefined

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signUpAction, initialState)

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
            <h1 className="text-2xl font-bold text-white">Create an account</h1>
            <p className="mt-1 text-sm text-slate-400">
              Join the Campus Service Management System
            </p>
          </div>

          {/* Global error banner */}
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
            {/* Full name */}
            <div>
              <label
                htmlFor="reg-full-name"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>
              <input
                id="reg-full-name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="reg-email"
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
                htmlFor="reg-password"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
