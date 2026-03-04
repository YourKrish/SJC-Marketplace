import { useState } from 'react';
import { Listing, CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, ArrowLeft, User, Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteListing } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const CATEGORY_IMAGES: Record<string, string> = {
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop',
  stationery: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=400&fit=crop',
  kit: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=400&fit=crop',
  uniform: 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&h=400&fit=crop',
  electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
  other: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',
};

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

  const images = listing.imageUrls && listing.imageUrls.length > 0
    ? listing.imageUrls
    : [CATEGORY_IMAGES[listing.category] || CATEGORY_IMAGES.other];

  const safeIndex = Math.min(imgIndex, images.length - 1);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setImgIndex(0); onClose(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative">
          <img
            src={images[safeIndex]}
            alt={listing.title}
            className="w-full aspect-[4/3] object-cover"
          />
          <button
            onClick={() => { setImgIndex(0); onClose(); }}
            className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm rounded-full p-2 hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-card-foreground" />
          </button>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-card-foreground">
              {CATEGORY_LABELS[listing.category]}
            </Badge>
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
            <DialogTitle className="text-xl font-display">{listing.title}</DialogTitle>
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
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Seller
                </h4>
                <Button
                  onClick={() => onMessageSeller?.(listing)}
                  className="w-full mt-2 bg-gradient-navy text-navy-foreground hover:opacity-90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Seller
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
