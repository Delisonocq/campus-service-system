/**
 * Server Actions for authentication.
 *
 * These run entirely on the server, so it's safe to talk to Supabase here.
 * The 'use server' directive tells Next.js to expose these as POST endpoints
 * that Client Components can invoke via form actions or startTransition.
 */
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Sign-up
// ---------------------------------------------------------------------------

export type AuthFormState = {
  error?: string
} | undefined

/**
 * Create a new Supabase user.
 *
 * full_name is stored in the signUp options.data object so the database
 * trigger can read it from auth.users.raw_user_meta_data and insert the
 * profiles row automatically — we never write to profiles directly.
 */
export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  // Basic server-side validation
  if (!fullName || fullName.length < 2) {
    return { error: 'Full name must be at least 2 characters.' }
  }
  if (!email) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The database trigger reads full_name from raw_user_meta_data
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // redirect() throws a Next.js control-flow exception — nothing runs after it
  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

/**
 * Sign an existing user in with email + password.
 */
export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please fill in both fields.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Surface a friendly message for the most common case
    if (
      error.message.toLowerCase().includes('invalid') ||
      error.message.toLowerCase().includes('credentials')
    ) {
      return { error: 'Incorrect email or password. Please try again.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

/**
 * Sign the current user out and redirect to /login.
 */
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
