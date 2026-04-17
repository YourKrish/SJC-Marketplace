import { Listing, CATEGORY_LABELS, CATEGORY_TAG_CLASSNAMES, CONDITION_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, ImageOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductCardProps {
  listing: Listing;
  onClick: () => void;
}

export default function ProductCard({ listing, onClick }: ProductCardProps) {
  const hasPhoto = listing.imageUrls && listing.imageUrls.length > 0;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-[1.125rem] bg-card border border-border/80 overflow-hidden shadow-card transition-all duration-300 ease-out hover:shadow-card-hover hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        {hasPhoto ? (
          <>
            <img
              src={listing.imageUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground" aria-hidden>
            <ImageOff className="w-10 h-10 opacity-50" />
            <span className="text-xs px-2 text-center">No photo</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-1rem)] z-[1]">
          <Badge
            className={cn(
              'font-medium text-xs',
              CATEGORY_TAG_CLASSNAMES[listing.category]
            )}
          >
            {CATEGORY_LABELS[listing.category]}
          </Badge>
          {listing.advertised && (
            <Badge className="bg-maroon text-maroon-foreground hover:bg-maroon font-semibold text-[10px] px-1.5 py-0 h-5 border-0 shadow-sm">
              AD
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-card-foreground line-clamp-2 font-body text-[15px] leading-snug">
          {listing.title}
        </h3>
        <p className="text-xl font-bold text-primary font-body tracking-tight">
          R{listing.price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border">
            {CONDITION_LABELS[listing.condition]}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 opacity-80" />
            {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </button>
  );
}
