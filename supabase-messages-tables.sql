-- Run in Supabase SQL Editor. Creates conversations and messages for per-listing chats.

-- One conversation per (listing, buyer); seller identified by email until they have an account.
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  buyer_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message TEXT,
  UNIQUE(listing_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add last_message if table already existed
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_email ON public.conversations(seller_email);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations: buyer or seller (by email) can read; buyer can create.
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update" ON public.conversations;

CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT USING (
    auth.uid() = buyer_id
    OR LOWER(TRIM(seller_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
  );

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "conversations_update" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = buyer_id
    OR LOWER(TRIM(seller_email)) = LOWER(TRIM(auth.jwt() ->> 'email'))
  );

-- Messages: participants can read; sender can insert (and must be participant).
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;

CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR LOWER(TRIM(c.seller_email)) = LOWER(TRIM(auth.jwt() ->> 'email')))
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR LOWER(TRIM(c.seller_email)) = LOWER(TRIM(auth.jwt() ->> 'email')))
    )
  );
