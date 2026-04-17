import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft } from 'lucide-react';
import { User } from '@/lib/auth';
import {
  Conversation,
  Message,
  getConversationsForUser,
  getMessagesForConversation,
  sendMessage,
} from '@/lib/messages';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessagesDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  initialConversation?: Conversation | null;
}

export default function MessagesDialog({ open, onClose, user, initialConversation }: MessagesDialogProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setConversations(getConversationsForUser(user.id));
      if (initialConversation) {
        setActiveConvo(initialConversation);
      }
    } else {
      setActiveConvo(null);
    }
  }, [open, user.id, initialConversation]);

  useEffect(() => {
    if (activeConvo) {
      setMessages(getMessagesForConversation(activeConvo.id));
    }
  }, [activeConvo]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim() || !activeConvo) return;
    const msg = sendMessage(activeConvo.id, user.id, user.name, newMsg);
    setMessages((prev) => [...prev, msg]);
    setConversations(getConversationsForUser(user.id));
    setNewMsg('');
  };

  const otherParticipant = (convo: Conversation) =>
    convo.participants.find((p) => p.id !== user.id)?.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
        {!activeConvo ? (
          <>
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle className="font-display">Messages</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 min-h-[300px]">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Send className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Message a seller from any listing!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConvo(convo)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {otherParticipant(convo)}
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
            </ScrollArea>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <button onClick={() => setActiveConvo(null)} className="p-1 hover:bg-muted rounded-md">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {otherParticipant(activeConvo)}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Re: {activeConvo.listingTitle}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[400px]">
              {messages.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8">
                  Start the conversation!
                </p>
              )}
              {messages.map((msg) => {
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
                      <p className={cn('text-[10px] mt-1', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground/60')}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button size="icon" variant="secondary" onClick={handleSend} disabled={!newMsg.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
