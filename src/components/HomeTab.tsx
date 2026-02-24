import { Listing } from '@/lib/types';
import ProductCard from './ProductCard';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

interface HomeTabProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export default function HomeTab({ listings, onSelectListing }: HomeTabProps) {
  const recent = listings.slice(0, 4);
  const trending = [...listings].sort((a, b) => a.price - b.price).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-navy rounded-2xl p-6 sm:p-8 text-navy-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-accent text-sm font-semibold">Welcome to</span>
        </div>
        <h2 className="font-body text-2xl sm:text-3xl font-bold mb-2">
          St John's Marketplace
        </h2>
        <p className="text-navy-foreground/70 text-sm max-w-md">
          Buy and sell school essentials — books, stationery, sports kit, uniforms and more. Connect directly with fellow students.
        </p>
      </div>

      {/* Recently Listed */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-body text-lg font-bold text-foreground">Recently Listed</h3>
        </div>
        {recent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No listings yet. Be the first to sell!</p>
        )}
      </section>

      {/* Best Deals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success" />
          <h3 className="font-body text-lg font-bold text-foreground">Best Deals</h3>
        </div>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No deals available right now.</p>
        )}
      </section>
    </div>
  );
}
