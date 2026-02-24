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
  };
}

/** Fetch all listings from Supabase (for everyone to see on the website). */
export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to fetch listings:', error);
    return [];
  }
  return (data ?? []).map((row: ListingRow) => rowToListing(row));
}

/** Save a new listing to the database so it appears on the website for everyone. */
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
