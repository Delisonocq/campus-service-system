/**
 * Navbar — shared across all auth & dashboard pages.
 *
 * Split into two pieces so the root layout can prerender:
 *
 *   NavbarShell   — static, no cookies, renders instantly as part of the shell.
 *   NavbarAuthSection — reads cookies (Supabase session), streams in behind
 *                       a <Suspense> boundary placed in the root layout.
 *
 * This follows the "push dynamic access down" pattern from the Next.js 16 docs:
 * https://nextjs.org/docs/app/guides/authentication-with-cache-components#step-2
 */

import Link from 'next/link'
import NotificationBell from './NotificationBell'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/actions/auth'

// ---------------------------------------------------------------------------
// NavbarShell — no runtime data, always prerenderable
// ---------------------------------------------------------------------------

function NavbarBrand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-bold tracking-tight text-white"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-extrabold">
        C
      </span>
      <span className="hidden sm:inline">Campus Service</span>
    </Link>
  )
}

// Static fallback shown while the auth section is streaming in.
// Matches the visual weight of the real auth buttons so there's no layout shift.
function NavbarAuthFallback() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-16 animate-pulse rounded-md bg-white/10" />
      <div className="h-7 w-20 animate-pulse rounded-md bg-white/10" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// NavbarAuthSection — reads cookies, must be inside <Suspense>
// ---------------------------------------------------------------------------

async function NavbarAuthSection() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Dashboard
        </Link>
        {/* signOutAction is a Server Action — wire it to a form */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-500 active:scale-95"
          >
            Sign out
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95"
      >
        Register
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Navbar — the public export; call site wraps this in <Suspense>
// ---------------------------------------------------------------------------

/**
 * The outer <header> + brand are static.
 * The auth-dependent right side streams in behind its own <Suspense> boundary,
 * so the navbar shell prerenders and the personalised buttons hydrate later.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <NavbarBrand />

        {/*
         * Wrap only the cookie-reading part in Suspense.
         * The fallback is a set of skeleton buttons so there's no layout shift.
         */}
        <Suspense fallback={<NavbarAuthFallback />}>
          <NavbarAuthSection />
        </Suspense>
      </nav>
    </header>
  )
}
