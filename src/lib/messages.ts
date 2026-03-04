import { supabase } from '@/supabase-client';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  participants: { id: string; name: string }[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  listingRemoved?: boolean;
}

interface ConversationRow {
  id: string;
  listing_id: string;
  listing_title: string;
  buyer_id: string;
  buyer_name: string;
  seller_email: string;
  seller_name: string;
  created_at: string;
  updated_at: string;
  last_message?: string | null;
  listing_removed?: boolean;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    participants: [
      { id: row.buyer_id, name: row.buyer_name },
      { id: row.seller_email, name: row.seller_name },
    ],
    lastMessage: row.last_message ?? undefined,
    lastMessageAt: row.updated_at,
    createdAt: row.created_at,
    listingRemoved: Boolean(row.listing_removed),
  };
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    text: row.text,
    createdAt: row.created_at,
  };
}

/** Fetch all conversations for the current user (buyer or seller), sorted by last activity. */
export async function getConversationsForUser(userId: string, userEmail?: string): Promise<Conversation[]> {
  const { data: buyerRows, error: e1 } = await supabase
    .from('conversations')
    .select('*')
    .eq('buyer_id', userId)
    .order('updated_at', { ascending: false });

  if (e1) {
    console.error('getConversationsForUser (buyer):', e1);
  }

  let sellerRows: ConversationRow[] = [];
  if (userEmail) {
    const { data, error: e2 } = await supabase
      .from('conversations')
      .select('*')
      .ilike('seller_email', userEmail);
    if (!e2) sellerRows = (data ?? []) as ConversationRow[];
  }

  const byId = new Map<string, ConversationRow>();
  for (const r of buyerRows ?? []) {
    byId.set(r.id, r as ConversationRow);
  }
  for (const r of sellerRows) {
    if (!byId.has(r.id)) byId.set(r.id, r);
  }

  const convos = Array.from(byId.values())
    .map(rowToConversation)
    .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());

  return convos;
}

/** Fetch messages for a conversation. */
export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getMessagesForConversation:', error);
    return [];
  }
  return (data ?? []).map((row: MessageRow) => rowToMessage(row));
}

/** Find existing conversation for this listing and buyer. */
export async function findConversation(listingId: string, buyerId: string): Promise<Conversation | undefined> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToConversation(data as ConversationRow);
}

/** Create or get conversation for this listing and buyer; seller is identified by email/name. */
export async function startConversation(
  listingId: string,
  listingTitle: string,
  buyer: { id: string; name: string },
  seller: { id: string; name: string }
): Promise<Conversation> {
  const existing = await findConversation(listingId, buyer.id);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      listing_title: listingTitle,
      buyer_id: buyer.id,
      buyer_name: buyer.name,
      seller_email: seller.id,
      seller_name: seller.name,
    })
    .select('*')
    .single();

  if (error) {
    console.error('startConversation:', error);
    throw new Error(error.message);
  }
  return rowToConversation(data as ConversationRow);
}

/** Send a message and update conversation updated_at. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<Message> {
  const { data: msgData, error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName,
      text: text.trim(),
    })
    .select('*')
    .single();

  if (msgError) {
    console.error('sendMessage:', msgError);
    throw new Error(msgError.message);
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString(), last_message: text.trim().slice(0, 200) })
    .eq('id', conversationId);

  return rowToMessage(msgData as MessageRow);
}

/** Count conversations for the current user (for badge). */
export async function getConversationCount(userId: string, userEmail?: string): Promise<number> {
  const convos = await getConversationsForUser(userId, userEmail);
  return convos.length;
}

/** Mark a conversation's listing as sold/removed (so both seller and buyer see the grey state). */
export async function markConversationListingRemoved(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ listing_removed: true, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('markConversationListingRemoved:', error);
    throw new Error(error.message);
  }
}
