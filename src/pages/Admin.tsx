import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { isAdminUser } from '@/lib/admin';
import {
  fetchPendingAdListings,
  fetchAllListingsForAdmin,
  approveAdListing,
  rejectAdListing,
  deleteListing,
} from '@/lib/store';
import { Listing } from '@/lib/types';
import { CATEGORY_LABELS, CONDITION_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pending, setPending] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const user = getSession();
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, isAdmin, navigate]);

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    const list = await fetchPendingAdListings();
    setPending(list);
    setLoadingPending(false);
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    const list = await fetchAllListingsForAdmin();
    setAllListings(list);
    setLoadingAll(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadPending();
    loadAll();
  }, [isAdmin, loadPending, loadAll]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      await approveAdListing(id);
      toast({ title: 'Ad approved', description: 'The listing is now visible on the marketplace.' });
      await loadPending();
      await loadAll();
    } catch (e) {
      toast({ title: 'Failed to approve', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      await rejectAdListing(id);
      toast({ title: 'Ad rejected', description: 'The listing will not appear on the marketplace.' });
      await loadPending();
      await loadAll();
    } catch (e) {
      toast({ title: 'Failed to reject', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setActingId(id);
    try {
      await deleteListing(id);
      toast({ title: 'Listing removed', description: 'The listing has been deleted.' });
      await loadPending();
      await loadAll();
    } catch (e) {
      toast({ title: 'Failed to remove', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1.5 hover:bg-muted rounded-md transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-10">
        {/* Pending ads */}
        <section>
          <h2 className="font-display text-lg font-bold mb-3">Pending ad approvals</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Advertised listings waiting for approval. Accept to show on the marketplace, reject to hide.
          </p>
          {loadingPending ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 bg-muted/30 rounded-lg text-center">No pending ads.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((listing) => (
                <li key={listing.id} className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{listing.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{listing.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[listing.category]}</span>
                      <span className="text-xs text-muted-foreground">{CONDITION_LABELS[listing.condition]}</span>
                      <span className="text-sm font-medium text-primary">R{listing.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">by {listing.sellerName}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(listing.id)}
                      disabled={actingId !== null}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(listing.id)}
                      disabled={actingId !== null}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* All listings – remove any */}
        <section>
          <h2 className="font-display text-lg font-bold mb-3">All listings</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Remove any listing from the marketplace.
          </p>
          {loadingAll ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : allListings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 bg-muted/30 rounded-lg text-center">No listings.</p>
          ) : (
            <ul className="space-y-2">
              {allListings.map((listing) => (
                <li key={listing.id} className="p-3 rounded-lg border border-border bg-card flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      R{listing.price.toFixed(2)} · {listing.sellerName}
                      {listing.advertised && (
                        <span className="ml-1">
                          · {listing.adApproved === true ? 'Approved ad' : listing.adApproved === false ? 'Rejected ad' : 'Pending ad'}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                    onClick={() => handleRemove(listing.id)}
                    disabled={actingId !== null}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
