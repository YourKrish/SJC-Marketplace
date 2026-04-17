export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  sellerName: string;
  sellerContact: string;
  imageUrls: string[];
  createdAt: string;
  advertised: boolean;
  adApproved?: boolean | null;
}

export type Category = 'books' | 'stationery' | 'kit' | 'uniform' | 'electronics' | 'notes' | 'other';
export type Condition = 'new' | 'like-new' | 'good' | 'fair';

/** Plain category names (no emojis), for labels and filters. */
export const CATEGORY_LABELS: Record<Category, string> = {
  books: 'Books',
  stationery: 'Stationery',
  kit: 'Sports kit',
  uniform: 'Uniform',
  electronics: 'Electronics',
  notes: 'Notes',
  other: 'Other',
};

/** Category chips — solid fills (no transparency) in St John’s palette. */
export const CATEGORY_TAG_CLASSNAMES: Record<Category, string> = {
  books: 'bg-[#E8EBF2] text-primary border-0 shadow-sm',
  stationery: 'bg-[#E4EDF7] text-secondary border-0 shadow-sm',
  kit: 'bg-[#F2E6EB] text-maroon border-0 shadow-sm',
  uniform: 'bg-[#ECEEF2] text-foreground border border-[#D8DEE6] shadow-sm',
  electronics: 'bg-[#E0ECF8] text-secondary border-0 shadow-sm',
  notes: 'bg-white text-foreground border border-border shadow-sm',
  other: 'bg-[#E8EAED] text-muted-foreground border-0 shadow-sm',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  new: 'Brand New',
  'like-new': 'Like New',
  good: 'Good',
  fair: 'Fair',
};

export const LISTING_FEE_PERCENTAGE = 0.10; // 10% cut

export function calculateListingFee(price: number): number {
  return Math.max(Math.round(price * LISTING_FEE_PERCENTAGE * 100) / 100, 1);
}

/** Tiered advertising fee by item price: 0–300 → R20, 300–500 → R40, 500–1000 → R80, 1000+ → R120 */
export function calculateAdvertisingFee(price: number): number {
  if (price < 300) return 20;
  if (price < 500) return 40;
  if (price < 1000) return 80;
  return 120;
}
