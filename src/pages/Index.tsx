import { useState, useCallback, useEffect } from 'react';
import { Home, ShoppingBag, User, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchListings } from '@/lib/store';
import { Listing } from '@/lib/types';
import { initAuth, logout as doLogout, User as UserType } from '@/lib/auth';
import { startConversation, getConversationCount } from '@/lib/messages';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import HomeTab from '@/components/HomeTab';
import MarketplaceTab from '@/components/MarketplaceTab';
import ProfileTab from '@/components/ProfileTab';
import MessagesTab from '@/components/MessagesTab';
import ProductDetail from '@/components/ProductDetail';
import CreateListing from '@/components/CreateListing';
import AuthDialog from '@/components/AuthDialog';

type Tab = 'home' | 'marketplace' | 'messages' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    let cancelled = false;
    setListingsLoading(true);
    fetchListings().then((data) => {
      if (!cancelled) {
        setListings(data);
        setListingsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setListingsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [initialConversationId, setInitialConversationId] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initAuth((u) => setUser(u));
    return cleanup;
  }, []);

  const refreshMessageCount = useCallback(() => {
    if (!user) return;
    getConversationCount(user.id, user.email).then(setMessageCount);
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (user) refreshMessageCount();
  }, [user, refreshMessageCount]);

  const refreshListings = useCallback(() => {
    fetchListings().then(setListings);
  }, []);

  const handleTabClick = (tab: Tab) => {
    if ((tab === 'profile' || tab === 'messages') && !user) {
      setShowAuth(true);
      return;
    }
    if (tab !== 'messages') setInitialConversationId(null);
    setActiveTab(tab);
  };

  const handleCreateListing = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowCreateListing(true);
  };

  const handleLogout = () => {
    doLogout();
    setUser(null);
    setActiveTab('home');
  };

  const handleMessageSeller = async (listing: Listing) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (user.email.toLowerCase() === listing.sellerContact.toLowerCase()) return;
    setSelectedListing(null);
    try {
      const convo = await startConversation(
        listing.id,
        listing.title,
        { id: user.id, name: user.name },
        { id: listing.sellerContact, name: listing.sellerName }
      );
      setInitialConversationId(convo.id);
      setActiveTab('messages');
      refreshMessageCount();
    } catch (e) {
      console.error('Failed to start conversation:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateListing={handleCreateListing}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {activeTab === 'home' && (
          <HomeTab listings={listings} onSelectListing={setSelectedListing} />
        )}
        {activeTab === 'marketplace' && (
          <MarketplaceTab listings={listings} searchQuery={searchQuery} onSelectListing={setSelectedListing} />
        )}
        {activeTab === 'messages' && user && (
          <MessagesTab
            user={user}
            initialConversationId={initialConversationId}
            onConversationUpdate={refreshMessageCount}
          />
        )}
        {activeTab === 'profile' && user && (
          <ProfileTab
            user={user}
            listings={listings}
            onSelectListing={setSelectedListing}
            onLogout={handleLogout}
            onOpenMessages={() => { setInitialConversationId(null); setActiveTab('messages'); }}
            messageCount={messageCount}
          />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="sticky bottom-0 bg-card border-t border-border z-40">
        <div className="max-w-6xl mx-auto flex">
          {[
            { id: 'home' as Tab, label: 'Home', icon: Home },
            { id: 'marketplace' as Tab, label: 'Marketplace', icon: ShoppingBag },
            { id: 'messages' as Tab, label: 'Messages', icon: MessageCircle, count: user ? messageCount : 0 },
            { id: 'profile' as Tab, label: user ? 'Profile' : 'Sign In', icon: User },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative',
                activeTab === id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="relative inline-flex">
                <Icon className="w-5 h-5" />
                {typeof count === 'number' && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      <ProductDetail
        listing={selectedListing}
        open={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        onMessageSeller={handleMessageSeller}
      />

      <CreateListing
        open={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onCreated={refreshListings}
        user={user}
      />

      <AuthDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={(u) => {
          setUser(u);
          setActiveTab('profile');
        }}
      />
    </div>
  );
};

export default Index;
