import type { User } from '@/lib/auth';

/**
 * Admin emails allowed to access the admin panel.
 * Set VITE_ADMIN_EMAIL in .env for a single email, or edit this array for multiple.
 */
const ADMIN_EMAILS_RAW = import.meta.env.VITE_ADMIN_EMAIL
  ? [import.meta.env.VITE_ADMIN_EMAIL]
  : [
      // Replace with your school email to access the admin panel:
      '27043@stjohnscollege.co.za',
    ];

const ADMIN_EMAILS = ADMIN_EMAILS_RAW.map((e: string) => e.trim().toLowerCase()).filter(Boolean);

/** True if the signed-in user is an admin (email in allowlist). Add your email below or set VITE_ADMIN_EMAIL in .env */
export function isAdminUser(user: User | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
