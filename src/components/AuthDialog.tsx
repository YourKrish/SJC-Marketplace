import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { signInWithGoogle, ALLOWED_EMAIL_DOMAIN_DISPLAY } from '@/lib/auth';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: import('@/lib/auth').User) => void;
}

export default function AuthDialog({ open, onClose }: AuthDialogProps) {
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!open) return;
    const err = searchParams.get('error');
    if (err === 'school_email_required') {
      setError(`Please sign in with your school Google account (${ALLOWED_EMAIL_DOMAIN_DISPLAY} only).`);
      setSearchParams({}, { replace: true });
    } else {
      setError('');
    }
  }, [open, searchParams, setSearchParams]);

  const handleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    }
  };

  const resetAndClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Sign in to the Marketplace
          </DialogTitle>
          <DialogDescription>
            This community is for St John&apos;s College only. Sign in with your school Google account to create your marketplace account and list or buy items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground text-center">
            Only <strong>{ALLOWED_EMAIL_DOMAIN_DISPLAY}</strong> email addresses can use this app.
          </p>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <Button
            type="button"
            onClick={handleSignIn}
            className="w-full bg-gradient-navy text-navy-foreground hover:opacity-90 flex items-center justify-center gap-2"
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with your school Google account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
