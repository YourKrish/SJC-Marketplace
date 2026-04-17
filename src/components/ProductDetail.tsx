import { useState } from 'react';
import { Listing, CATEGORY_LABELS, CATEGORY_TAG_CLASSNAMES, CONDITION_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { MessageCircle, ArrowLeft, User, Clock, ChevronLeft, ChevronRight, Trash2, ImageOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteListing } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailProps {
  listing: Listing | null;
  open: boolean;
  onClose: () => void;
  onMessageSeller?: (listing: Listing) => void;
  /** When set, if the current user is the seller, show a "Remove listing" button. */
  currentUserEmail?: string | null;
  /** Called after the listing is successfully removed (e.g. to refresh lists). */
  onListingRemoved?: () => void;
}

export default function ProductDetail({ listing, open, onClose, onMessageSeller, currentUserEmail, onListingRemoved }: ProductDetailProps) {
  const { toast } = useToast();
  const [imgIndex, setImgIndex] = useState(0);
  const [removing, setRemoving] = useState(false);
  const isOwner = !!listing && !!currentUserEmail && listing.sellerContact.toLowerCase() === currentUserEmail.toLowerCase();

  if (!listing) return null;

  const images = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : [];
  const safeIndex = images.length > 0 ? Math.min(imgIndex, images.length - 1) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setImgIndex(0); onClose(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative">
          {images.length > 0 ? (
            <img
              src={images[safeIndex]}
              alt={listing.title}
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <div
              className="w-full aspect-[4/3] bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground"
              role="img"
              aria-label="No photo for this listing"
            >
              <ImageOff className="w-12 h-12 opacity-50" />
              <span className="text-sm">No photo attached</span>
            </div>
          )}
          <button
            onClick={() => { setImgIndex(0); onClose(); }}
            className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-card-foreground" />
          </button>
          <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5 justify-end max-w-[calc(100%-5rem)]">
            <Badge className={cn('text-xs', CATEGORY_TAG_CLASSNAMES[listing.category])}>
              {CATEGORY_LABELS[listing.category]}
            </Badge>
            {listing.advertised && (
              <Badge className="bg-maroon text-maroon-foreground hover:bg-maroon font-semibold text-[10px] px-1.5 py-0 h-5 border-0 shadow-sm">
                AD
              </Badge>
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-card-foreground" />
              </button>
              <button
                onClick={() => setImgIndex(i => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-card-foreground" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === safeIndex ? 'bg-card' : 'bg-card/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 space-y-5">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-xl font-body font-bold tracking-tight">{listing.title}</DialogTitle>
            <p className="text-2xl font-bold text-primary font-body">
              R{listing.price.toFixed(2)}
            </p>
          </DialogHeader>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{CONDITION_LABELS[listing.condition]}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Listed {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">{listing.description}</p>

          <div className="border-t border-border pt-4 space-y-2">
            {isOwner ? (
              <>
                <p className="text-sm text-muted-foreground">This is your listing.</p>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={removing}
                  onClick={async () => {
                    if (!listing) return;
                    setRemoving(true);
                    try {
                      await deleteListing(listing.id);
                      toast({ title: 'Listing removed', description: 'Your listing has been removed from the marketplace.' });
                      onListingRemoved?.();
                      onClose();
                    } catch {
                      toast({ title: 'Could not remove listing', variant: 'destructive' });
                    } finally {
                      setRemoving(false);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {removing ? 'Removing…' : 'Remove listing'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Seller
                  </h4>
                  <p className="text-sm font-medium text-foreground">{listing.sellerName}</p>
                  <VerifiedBadge />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => onMessageSeller?.(listing)}
                  className="w-full mt-1 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message seller
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
