import { Listing, CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductCardProps {
  listing: Listing;
  onClick: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
  stationery: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop',
  kit: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop',
  uniform: 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=400&h=300&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
  other: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
};

export default function ProductCard({ listing, onClick }: ProductCardProps) {
  const imageUrl = (listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls[0] : '') || CATEGORY_IMAGES[listing.category] || CATEGORY_IMAGES.other;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl bg-card border border-border overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-card-foreground font-medium text-xs">
            {CATEGORY_LABELS[listing.category]}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-card-foreground line-clamp-1 font-body text-sm">
          {listing.title}
        </h3>
        <p className="text-lg font-bold text-primary font-body">
          R{listing.price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs font-normal">
            {CONDITION_LABELS[listing.condition]}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </button>
  );
}
