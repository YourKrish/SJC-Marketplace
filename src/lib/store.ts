import { supabase } from '@/supabase-client';
import { Listing } from './types';

/** DB row shape (Supabase listings table) */
export interface ListingRow {
  id: string;
  item_title: string;
  item_description: string | null;
  timestamp: string;
  condition: string;
  category: string;
  price: number;
  seller_name: string | null;
  seller_contact: string | null;
  image_urls: string[] | null;
  advertised: boolean;
  ad_approved?: boolean | null;
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.item_title,
    description: row.item_description ?? '',
    price: Number(row.price),
    category: row.category as Listing['category'],
    condition: row.condition as Listing['condition'],
    sellerName: row.seller_name ?? '',
    sellerContact: row.seller_contact ?? '',
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
    createdAt: row.timestamp,
    advertised: Boolean(row.advertised),
    adApproved: row.ad_approved ?? undefined,
  };
}

/** Fetch listings visible on the marketplace: non-advertised or advertised and approved. */
export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .or('advertised.eq.false,and(advertised.eq.true,ad_approved.eq.true)')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to fetch listings:', error);
    return [];
  }
  return (data ?? []).map((row: ListingRow) => rowToListing(row));
}

/** Save a new listing. Advertised listings get ad_approved = null (pending admin approval). */
export async function addListing(listing: Listing): Promise<void> {
  const { error } = await supabase.from('listings').insert({
    id: listing.id,
    item_title: listing.title,
    item_description: listing.description,
    timestamp: listing.createdAt,
    condition: listing.condition,
    category: listing.category,
    price: listing.price,
    seller_name: listing.sellerName,
    seller_contact: listing.sellerContact,
    image_urls: listing.imageUrls,
    advertised: listing.advertised,
    ad_approved: listing.advertised ? null : undefined,
  });

  if (error) {
    console.error('Failed to save listing:', error);
    throw new Error(error.message);
  }
}

/** Get a single listing by id (e.g. from an already-fetched list). */
export function getListingById(listings: Listing[], id: string): Listing | undefined {
  return listings.find((l) => l.id === id);
}

/** Delete a listing from the database (e.g. when seller marks as sold). */
export async function deleteListing(listingId: string): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) {
    console.error('Failed to delete listing:', error);
    throw new Error(error.message);
  }
}

/** Fetch listings pending admin approval (advertised and ad_approved IS NULL). */
export async function fetchPendingAdListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('advertised', true)
    .is('ad_approved', null)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to fetch pending ad listings:', error);
    return [];
  }
  return (data ?? []).map((row: ListingRow) => rowToListing(row));
}

/** Approve an advertised listing so it appears on the marketplace. */
export async function approveAdListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').update({ ad_approved: true }).eq('id', id);
  if (error) {
    console.error('Failed to approve listing:', error);
    throw new Error(error.message);
  }
}

/** Reject an advertised listing so it does not appear on the marketplace. */
export async function rejectAdListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').update({ ad_approved: false }).eq('id', id);
  if (error) {
    console.error('Failed to reject listing:', error);
    throw new Error(error.message);
  }
}

/** Fetch all listings for admin (no approval filter). */
export async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to fetch all listings for admin:', error);
    return [];
  }
  return (data ?? []).map((row: ListingRow) => rowToListing(row));
}
