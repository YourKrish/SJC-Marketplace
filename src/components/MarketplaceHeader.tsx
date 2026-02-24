import collegeCrest from '@/assets/college-crest.png';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateListing: () => void;
}

export default function MarketplaceHeader({ searchQuery, onSearchChange, onCreateListing }: MarketplaceHeaderProps) {
  return (
    <header className="bg-gradient-navy text-navy-foreground sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img alt="St John's College" className="w-10 h-10 object-cover rounded-xl" src="/lovable-uploads/183793d1-b257-467b-abe4-7fe0fbe50a54.jpg" />
            <div className="hidden sm:block">
              <h1 className="font-body text-lg font-bold leading-tight">St John's</h1>
              <p className="text-xs opacity-75">Marketplace</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-navy-foreground/10 border-navy-foreground/20 text-navy-foreground placeholder:text-navy-foreground/50 focus:bg-navy-foreground/20"
              maxLength={100} />

          </div>

          <Button onClick={onCreateListing} className="bg-gradient-gold text-gold-foreground font-semibold hover:opacity-90 shrink-0">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sell Item</span>
            <span className="sm:hidden">Sell</span>
          </Button>
        </div>
      </div>
    </header>);

}