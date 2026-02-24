import { User } from '@/lib/auth';
import { Listing } from '@/lib/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { LogOut, Package, User as UserIcon, Mail, MessageCircle } from 'lucide-react';

interface ProfileTabProps {
  user: User;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onLogout: () => void;
  onOpenMessages: () => void;
  messageCount?: number;
}

export default function ProfileTab({ user, listings, onSelectListing, onLogout, onOpenMessages, messageCount = 0 }: ProfileTabProps) {
  const myListings = listings.filter(
    (l) => l.sellerContact.toLowerCase() === user.email.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-gradient-navy rounded-2xl p-6 sm:p-8 text-navy-foreground">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{user.name}</h2>
              <p className="text-navy-foreground/70 text-sm flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onOpenMessages} className="text-navy-foreground/70 hover:text-navy-foreground hover:bg-navy-foreground/10">
              <MessageCircle className="w-4 h-4 mr-1" /> Messages
              {messageCount > 0 && (
                <span className="ml-1 bg-accent text-accent-foreground text-[10px] rounded-full px-1.5">
                  {messageCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-navy-foreground/70 hover:text-navy-foreground hover:bg-navy-foreground/10">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* My Listings */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">My Listings</h3>
          <span className="text-sm text-muted-foreground">({myListings.length})</span>
        </div>
        {myListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">You haven't listed any items yet.</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Tap "Sell Item" to get started!</p>
          </div>
        )}
      </section>
    </div>
  );
}
