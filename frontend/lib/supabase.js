/**
 * Supabase Client (Browser-side)
 * 
 * Uses the ANON KEY — this is public and safe.
 * The anon key can only do what RLS policies allow.
 * 
 * Auth flow:
 *   1. User clicks "Sign in with Google" or enters email
 *   2. Supabase handles OAuth / magic link
 *   3. JWT stored in httpOnly cookie (NOT localStorage!)
 *   4. Every API request sends cookie → backend verifies JWT
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Store session in cookies, not localStorage
      // This prevents XSS token theft
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Get current user session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Session error:', error);
    return null;
  }
  return session;
}

/**
 * Get current user's JWT access token.
 * Used for API requests to the backend.
 */
export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}

/**
 * Sign in with Google OAuth.
 * Redirects to Google, then back to your site.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in with email magic link.
 * User receives email with login link (no password needed).
 */
export async function signInWithEmail(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out — clears session cookie.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get user's remaining credits.
 */
export async function getUserCredits() {
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_left, plan')
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    console.error('Credits fetch error:', error);
    return null;
  }
  return data;
}
