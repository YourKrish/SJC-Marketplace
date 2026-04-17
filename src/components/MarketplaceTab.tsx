import { Listing, Category } from '@/lib/types';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useState } from 'react';
import { PackageSearch } from 'lucide-react';

interface MarketplaceTabProps {
  listings: Listing[];
  searchQuery: string;
  onSelectListing: (listing: Listing) => void;
}

export default function MarketplaceTab({ listings, searchQuery, onSelectListing }: MarketplaceTabProps) {
  const [category, setCategory] = useState<Category | 'all'>('all');

  const filtered = listings
    .filter((l) => {
      const matchesCategory = category === 'all' || l.category === category;
      const matchesSearch = !searchQuery || 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (category !== 'all') return 0;
      const adDiff = Number(b.advertised) - Number(a.advertised);
      return adDiff !== 0 ? adDiff : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <CategoryFilter selected={category} onChange={setCategory} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((listing) => (
            <ProductCard key={listing.id} listing={listing} onClick={() => onSelectListing(listing)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <PackageSearch className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold text-muted-foreground">No items found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery ? `No results for "${searchQuery}"` : 'No listings in this category yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
