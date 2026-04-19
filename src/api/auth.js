/**
 * auth.js — Supabase adapter replacing base44.auth.*
 *
 * Replaces:
 *   base44.auth.me()                         → auth.me()
 *   base44.auth.logout(redirectUrl)          → auth.logout(redirectUrl)
 *   base44.auth.redirectToLogin(redirectUrl) → auth.redirectToLogin(redirectUrl)
 */

import { supabase } from './supabaseClient';

export const auth = {
  /**
   * Returns the currently logged-in user, or throws if not authenticated.
   * Mirrors: base44.auth.me()
   */
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('Not authenticated');
    // Normalize shape to match what components expect
    // base44 returned { email, role, ... } — we mirror that
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role ?? 'user',
      name: user.user_metadata?.name ?? user.email,
      ...user.user_metadata,
    };
  },

  /**
   * Logs out the current user, then optionally redirects.
   * Mirrors: base44.auth.logout(redirectUrl?)
   */
  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  /**
   * Redirects the user to the Supabase OAuth login page.
   * Mirrors: base44.auth.redirectToLogin(redirectUrl?)
   *
   * Uses Magic Link by default. Switch to OAuth provider if needed:
   *   supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
   */
  redirectToLogin(redirectUrl) {
    // Store the intended destination so we can redirect back after login
    const redirectTo = redirectUrl || window.location.href;
    // Option A — Magic Link (email-based, no password):
    //   Prompt for email then call supabase.auth.signInWithOtp({ email })
    // Option B — OAuth (e.g. Google):
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    // ⚠️ Change 'google' to any Supabase-supported provider:
    //   'github' | 'facebook' | 'azure' | 'twitter' | etc.
  },
};
