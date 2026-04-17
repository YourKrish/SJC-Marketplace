import { Search, Plus, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateListing: () => void;
  showAdminLink?: boolean;
}

export default function MarketplaceHeader({ searchQuery, onSearchChange, onCreateListing, showAdminLink }: MarketplaceHeaderProps) {
  return (
    <header className="bg-gradient-navy text-navy-foreground sticky top-0 z-50 shadow-md shadow-primary/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              alt="St John's College"
              className="w-10 h-10 object-cover rounded-full ring-2 ring-white/25 shadow-md shrink-0"
              src="/lovable-uploads/183793d1-b257-467b-abe4-7fe0fbe50a54.jpg"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="font-body text-lg font-bold leading-tight tracking-tight truncate">St John&apos;s College</h1>
              <p className="text-xs text-white/70 font-medium">Marketplace</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 pointer-events-none" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 pl-10 rounded-full border border-white/20 bg-white/10 text-navy-foreground placeholder:text-white/45 focus-visible:bg-white/[0.14] focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/45 focus-visible:shadow-search-focus transition-shadow duration-200"
              maxLength={100}
            />
          </div>

          <Button
            onClick={onCreateListing}
            className="bg-gradient-sell-cta text-white font-semibold rounded-full px-4 sm:px-5 shrink-0 shadow-md transition-transform duration-200 hover:scale-[1.03] hover:shadow-[0_8px_28px_-4px_rgba(128,0,32,0.42)] active:scale-[0.98] border-0"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sell Item</span>
            <span className="sm:hidden">Sell</span>
          </Button>
          {showAdminLink && (
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full border-white/35 text-navy-foreground bg-white/5 hover:bg-white/15 hover:text-white"
              >
                <Shield className="w-4 h-4 mr-1" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
