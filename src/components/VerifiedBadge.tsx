import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type VerifiedBadgeProps = {
  className?: string;
  /** Light text for use on navy / gradient headers */
  variant?: 'onDark' | 'default';
};

export function VerifiedBadge({ className, variant = 'default' }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        variant === 'onDark'
          ? 'bg-white/15 text-white border border-white/25'
          : 'bg-primary/8 text-primary border border-primary/15',
        className,
      )}
    >
      <BadgeCheck className="w-3 h-3 shrink-0" aria-hidden />
      Verified St John&apos;s student
    </span>
  );
}
