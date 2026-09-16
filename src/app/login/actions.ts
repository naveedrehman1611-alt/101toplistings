'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth';
import type { LoginState } from './action-state';


// One message for every failure mode. Distinguishing "no such account" from
// "wrong password" turns the form into an account-enumeration oracle.
const GENERIC_ERROR = 'Those details do not match an account. Check your email and password.';

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: GENERIC_ERROR };

  // `next` arrives from the client, so it is re-validated here rather than
  // trusted — a Server Action is a plain POST endpoint anyone can call.
  const next = safeNextPath(formData.get('next')?.toString());

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: GENERIC_ERROR };

  // redirect() throws, so nothing below runs. Cookies were already set by the
  // client's setAll, which also re-renders the route in the same response.
  redirect(next);
}
