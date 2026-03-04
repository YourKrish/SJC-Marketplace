-- ============================================================
-- STEP 1: In Supabase Dashboard go to: SQL Editor → New query
-- STEP 2: Paste this entire file and click "Run" (or Ctrl+Enter)
-- STEP 3: You should see "Success. No rows returned" – then the
--         public.listings table exists and your app will find it.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  item_description TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  condition TEXT NOT NULL,
  category TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  seller_name TEXT,
  seller_contact TEXT,
  image_urls JSONB DEFAULT '[]',
  advertised BOOLEAN DEFAULT false,
  ad_approved BOOLEAN DEFAULT NULL
);

-- Add ad_approved if table already existed (for ad approval flow)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS ad_approved BOOLEAN DEFAULT NULL;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if you re-run this script (avoids "already exists" errors)
DROP POLICY IF EXISTS "Allow public read" ON public.listings;
DROP POLICY IF EXISTS "Allow public insert" ON public.listings;
DROP POLICY IF EXISTS "Allow public update" ON public.listings;
DROP POLICY IF EXISTS "Allow public delete" ON public.listings;

CREATE POLICY "Allow public read" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.listings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.listings FOR DELETE USING (true);
