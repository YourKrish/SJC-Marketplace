import { useState, useCallback, useEffect } from 'react';
import { Home, ShoppingBag, User, MessageCircle, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GITHUB_PROFILE_URL, GITHUB_USERNAME } from '@/lib/github';
import { fetchListings } from '@/lib/store';
import { Listing } from '@/lib/types';
import { initAuth, logout as doLogout, User as UserType } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import { startConversation, getUnreadMessageCount } from '@/lib/messages';
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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchListings().then((data) => {
      if (!cancelled) setListings(data);
    }).catch(() => { /* ignore */ });
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
    getUnreadMessageCount().then(setMessageCount);
  }, [user]);

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
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
        <div className="absolute left-1/2 bottom-32 h-96 w-96 -translate-x-1/2 opacity-[0.02] crest-watermark" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <MarketplaceHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateListing={handleCreateListing}
          showAdminLink={isAdminUser(user)}
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
              onListingRemoved={refreshListings}
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

        <footer className="relative z-10 shrink-0 border-t border-border/60 bg-background/80 py-2.5 px-4">
          <p className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
            <Github className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              @{GITHUB_USERNAME}
            </a>
          </p>
        </footer>

        <nav className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border z-40 shadow-[0_-4px_24px_-8px_rgba(30,42,68,0.08)]">
          <div className="max-w-6xl mx-auto flex">
            {[
              { id: 'home' as Tab, label: 'Home', icon: Home },
              { id: 'marketplace' as Tab, label: 'Marketplace', icon: ShoppingBag },
              { id: 'messages' as Tab, label: 'Messages', icon: MessageCircle, count: user ? messageCount : 0 },
              { id: 'profile' as Tab, label: user ? 'Profile' : 'Sign In', icon: User },
            ].map(({ id, label, icon: Icon, count }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTabClick(id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-200 relative',
                    active ? 'text-maroon' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-11 rounded-b-full bg-maroon transition-all duration-300"
                      aria-hidden
                    />
                  )}
                  <span className="relative inline-flex">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-transform duration-300 ease-out',
                        active && 'scale-110 drop-shadow-sm'
                      )}
                    />
                    {typeof count === 'number' && count > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full bg-maroon text-maroon-foreground text-[10px] font-semibold flex items-center justify-center px-1 shadow-sm">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </span>
                  <span className={cn('text-xs font-medium', active && 'text-maroon')}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <ProductDetail
          listing={selectedListing}
          open={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          onMessageSeller={handleMessageSeller}
          currentUserEmail={user?.email}
          onListingRemoved={() => {
            refreshListings();
            setSelectedListing(null);
          }}
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
    </div>
  );
};

export default Index;
