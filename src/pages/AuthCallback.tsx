import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase-client';
import { setSessionFromSupabaseUser } from '@/lib/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ok' | 'invalid'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        setStatus('invalid');
        navigate('/', { replace: true });
        return;
      }

      const user = setSessionFromSupabaseUser(session.user);
      if (!user) {
        await supabase.auth.signOut();
        navigate('/?error=school_email_required', { replace: true });
        return;
      }

      setStatus('ok');
      navigate('/', { replace: true });
    }

    handleCallback();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">
        {status === 'loading' ? 'Signing you in…' : status === 'ok' ? 'Redirecting…' : 'Redirecting…'}
      </p>
    </div>
  );
}
