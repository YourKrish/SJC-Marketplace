import { supabase } from '@/supabase-client';

export const SCHOOL_EMAIL_SUFFIX = '@stjohnscollege.co.za';
export const ALLOWED_EMAIL_DOMAIN_DISPLAY = 'stjohnscollege.co.za';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const SESSION_KEY = 'sjc-marketplace-session';

function supabaseUserToAppUser(sbUser: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } }): User {
  const email = (sbUser.email ?? '').toLowerCase();
  const name = sbUser.user_metadata?.full_name ?? sbUser.user_metadata?.name ?? email.split('@')[0] ?? 'User';
  return {
    id: sbUser.id,
    name: name.trim() || 'User',
    email,
    createdAt: new Date().toISOString(),
  };
}

function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().endsWith(SCHOOL_EMAIL_SUFFIX.toLowerCase());
}

/** Sign in with Google (redirects to Google; after return, initAuth handles session). */
export async function signInWithGoogle(): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { prompt: 'select_account' },
    },
  });
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  supabase.auth.signOut();
}

export function getSession(): User | null {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

function setSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/** Used by AuthCallback: set app session from Supabase user if email is allowed; returns User or null. */
export function setSessionFromSupabaseUser(sbUser: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } }): User | null {
  const email = (sbUser.email ?? '').toLowerCase();
  if (!isAllowedEmail(email)) return null;
  const user = supabaseUserToAppUser(sbUser);
  setSession(user);
  return user;
}

/**
 * Initialize auth: restore session from Supabase after OAuth redirect, and subscribe to auth changes.
 * Call once on app load (e.g. in Index useEffect).
 * - If Supabase session exists and email is @stjohnscollege.co.za → onUser(user)
 * - If Supabase session exists but email is not allowed → sign out and onUser(null, errorMessage)
 */
export function initAuth(onUser: (user: User | null, error?: string) => void): () => void {
  const applySession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      localStorage.removeItem(SESSION_KEY);
      onUser(null);
      return;
    }
    const email = (session.user.email ?? '').toLowerCase();
    if (!isAllowedEmail(email)) {
      await supabase.auth.signOut();
      localStorage.removeItem(SESSION_KEY);
      onUser(null, 'Only St John\'s College school accounts can use this app. Please sign in with your @stjohnscollege.co.za Google account.');
      return;
    }
    const user = supabaseUserToAppUser(session.user);
    setSession(user);
    onUser(user);
  };

  applySession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      onUser(null);
      return;
    }
    const email = (session.user.email ?? '').toLowerCase();
    if (!isAllowedEmail(email)) {
      supabase.auth.signOut();
      localStorage.removeItem(SESSION_KEY);
      onUser(null, 'Only St John\'s College school accounts can use this app. Please sign in with your @stjohnscollege.co.za Google account.');
      return;
    }
    const user = supabaseUserToAppUser(session.user);
    setSession(user);
    onUser(user);
  });

  return () => subscription?.unsubscribe?.();
}

export function updateUser(updates: Partial<Pick<User, 'name'>>): User | null {
  const session = getSession();
  if (!session) return null;
  const next: User = { ...session, ...updates };
  if (updates.name) next.name = updates.name.trim();
  setSession(next);
  return next;
}
