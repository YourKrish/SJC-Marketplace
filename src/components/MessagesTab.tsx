import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { User } from '@/lib/auth';
import {
  Conversation,
  Message,
  getConversationsForUser,
  getMessagesForConversation,
  sendMessage,
  markConversationListingRemoved,
  markConversationMessagesAsRead,
} from '@/lib/messages';
import { deleteListing } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessagesTabProps {
  user: User;
  initialConversationId?: string | null;
  onConversationUpdate?: () => void;
  onListingRemoved?: () => void;
}

export default function MessagesTab({ user, initialConversationId, onConversationUpdate, onListingRemoved }: MessagesTabProps) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSeller = (convo: Conversation) =>
    convo.participants.some((p) => p.id === user.email);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getConversationsForUser(user.id, user.email);
      setConversations(list);
    } finally {
      setLoading(false);
    }
  }, [user.id, user.email]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (initialConversationId && conversations.length > 0 && !activeConvo) {
      const found = conversations.find((c) => c.id === initialConversationId);
      if (found) setActiveConvo(found);
    }
  }, [initialConversationId, conversations, activeConvo]);

  useEffect(() => {
    if (!activeConvo) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    getMessagesForConversation(activeConvo.id).then((list) => {
      setMessages(list);
      setMessagesLoading(false);
      markConversationMessagesAsRead(activeConvo.id, user.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvo.id ? { ...c, lastMessageRead: true } : c))
      );
      onConversationUpdate?.();
    });
  }, [activeConvo?.id, user.id, onConversationUpdate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConvo) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeConvo.id, user.id, user.name, newMsg);
      setMessages((prev) => [...prev, msg]);
      setNewMsg('');
      await loadConversations();
      onConversationUpdate?.();
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = (convo: Conversation) =>
    convo.participants.find((p) => p.id !== user.id && p.id !== user.email)?.name || 'Unknown';

  const hasUnread = (convo: Conversation) =>
    convo.lastMessageSenderId != null &&
    convo.lastMessageSenderId !== user.id &&
    !convo.lastMessageRead;

  const handleMarkSold = async () => {
    if (!activeConvo || removing) return;
    setRemoving(true);
    try {
      await deleteListing(activeConvo.listingId);
      await markConversationListingRemoved(activeConvo.id);
      setActiveConvo((prev) => (prev ? { ...prev, listingRemoved: true } : null));
      toast({ title: 'Listing removed', description: 'The item has been marked as sold and removed from the marketplace.' });
      onListingRemoved?.();
      await loadConversations();
      onConversationUpdate?.();
    } catch (e) {
      toast({
        title: 'Could not remove listing',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[60vh]">
      {!activeConvo ? (
        <>
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Messages</h2>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Send className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Message a seller from any listing to start a conversation.</p>
            </div>
          ) : (
            <div className="divide-y divide-border mt-2">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate flex items-center gap-2">
                        {otherParticipant(convo)}
                        {hasUnread(convo) && (
                          <span className="w-2 h-2 rounded-full bg-destructive shrink-0" aria-hidden />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        Re: {convo.listingTitle}
                      </p>
                      {convo.lastMessage && (
                        <p className="text-xs text-muted-foreground/70 truncate mt-1">
                          {convo.lastMessage}
                        </p>
                      )}
                    </div>
                    {convo.lastMessageAt && (
                      <span className="text-[10px] text-muted-foreground/60 ml-2 shrink-0">
                        {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <button
              onClick={() => setActiveConvo(null)}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
              aria-label="Back to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {otherParticipant(activeConvo)}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Re: {activeConvo.listingTitle}
              </p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[50vh]"
          >
            {messagesLoading ? (
              <p className="text-xs text-muted-foreground py-4">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                Start the conversation!
              </p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      )}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={cn(
                          'text-[10px] mt-1',
                          isMine ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                        )}
                      >
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeConvo && (activeConvo.listingRemoved ? (
            <div className="px-3 pt-2 pb-1 border-t border-border">
              <div className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 py-2.5 text-muted-foreground text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Marked as sold and removed listing
              </div>
            </div>
          ) : isSeller(activeConvo) ? (
            <div className="px-3 pt-2 pb-1 border-t border-border">
              <Button
                variant="default"
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
                onClick={handleMarkSold}
                disabled={removing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {removing ? 'Removing…' : 'Mark as sold and remove listing'}
              </Button>
            </div>
          ) : null)}

          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button size="icon" variant="secondary" onClick={handleSend} disabled={!newMsg.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
