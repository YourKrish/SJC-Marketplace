import { Listing } from '@/lib/types';
import ProductCard from './ProductCard';
import { Megaphone, Clock, Sparkles } from 'lucide-react';

interface HomeTabProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
}

export default function HomeTab({ listings, onSelectListing }: HomeTabProps) {
  const recent = listings.slice(0, 4);
  const advertised = listings.filter((l) => l.advertised).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-navy p-6 sm:p-8 text-navy-foreground shadow-lg ring-1 ring-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_55%)] pointer-events-none" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white/90" />
            <span className="text-white/85 text-sm font-semibold tracking-wide">Welcome to</span>
          </div>
          <h2 className="font-body text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
            St John&apos;s Marketplace
          </h2>
          <p className="text-white/75 text-sm max-w-lg leading-relaxed">
            A trusted space for students to buy and sell textbooks, kit, uniform, stationery, and more,with the values of{' '}
            <span className="text-white/90 font-medium">tradition, excellence, and character</span> in mind.
          </p>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-secondary" />
          <h3 className="font-body text-lg font-bold text-foreground">Advertised</h3>
        </div>
        {advertised.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {advertised.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No advertised listings right now.</p>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-body text-lg font-bold text-foreground">Recently listed</h3>
        </div>
        {recent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map((listing) => (
              <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No listings yet. Be the first to sell.</p>
        )}
      </section>
    </div>
  );
}
