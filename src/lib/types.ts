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

export const CATEGORY_LABELS: Record<Category, string> = {
  books: '📚 Books',
  stationery: '✏️ Stationery',
  kit: '🏑 Sports Kit',
  uniform: '👔 Uniform',
  electronics: '💻 Electronics',
  notes: '📝 Notes',
  other: '📦 Other',
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
