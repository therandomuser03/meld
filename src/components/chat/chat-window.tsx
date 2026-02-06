"use client";

import * as React from "react";
import { sendMessage, getThreadMessages, markThreadAsRead } from "@/actions/chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreVertical, Search, Send, Smile, Users, Phone, Video, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatDoodles } from "@/components/chat/chat-doodles";
import { cn } from "@/lib/utils";

import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TranslateDialog } from "./translate-dialog";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useChatStore } from "@/lib/store/chat-store";
import { useChatRealtime } from "@/hooks/use-chat-realtime";

interface ChatWindowProps {
  threadId: string;
  initialMessages?: any[];
  currentUserId?: string;
  otherUser: {
    name: string;
    avatar: string;
  };
  userLanguages?: { code: string; name: string }[];
  isGroup?: boolean;
}

export function ChatWindow({ threadId, initialMessages = [], currentUserId, otherUser, userLanguages = [], isGroup = false }: ChatWindowProps) {
  const { messages: storeMessages, setMessages, addMessage } = useChatStore();
  const [inputText, setInputText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Translation state
  const [translatingMsg, setTranslatingMsg] = React.useState<{ id: string, content: string } | null>(null);

  // Typing state
  const [otherUserTyping, setOtherUserTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { resolvedTheme } = useTheme();

  // Initial state sync & Real-time setup
  const threadMessages = storeMessages[threadId] || [];

  React.useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(threadId, initialMessages);
    }
    if (currentUserId) {
      // Mark as read when opening
      markThreadAsRead(threadId, currentUserId);
    }
  }, [threadId, currentUserId]); // Only run on mount or thread change

  useChatRealtime(threadId);

  React.useEffect(() => {
    // Subscribe to real-time events for this thread
    const channel = supabase.channel(`thread:${threadId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setOtherUserTyping(true);
          // Clear typing indicator after 3 seconds of no events
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId]);

  const handleInputStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    // Broadcast typing
    if (currentUserId && e.target.value.length > 0) {
      supabase.channel(`thread:${threadId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      });
    }
  };


  const messages = threadMessages
    .filter(msg => !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(msg => ({
      id: msg.id,
      content: msg.content,
      isOwn: msg.authorId === currentUserId,
      time: msg.createdAt,
      author: msg.author?.name || "Unknown",
      authorAvatar: msg.author?.avatarUrl || undefined,
      translatedContent: msg.translations?.[0]?.translatedContent,
      sourceLanguage: msg.sourceLocale || undefined,
    }));

  // Scroll to bottom on load and new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages.length, otherUserTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentUserId || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await sendMessage(threadId, currentUserId, inputText.trim());
      addMessage(threadId, sentMessage as any); // Optimistic / Immediate update
      setInputText("");

      // Broadcast new message to others immediately
      supabase.channel(`thread:${threadId}`).send({
        type: 'broadcast',
        event: 'new_message',
        payload: sentMessage
      });

      // Broadcast stop typing
      supabase.channel(`thread:${threadId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping: false }
      });
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  const handleTranslationComplete = (msgId: string, translatedText: string, locale: string) => {
    // Update store state
    const currentMsgs = storeMessages[threadId] || [];
    const updated = currentMsgs.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          translations: [{ translatedContent: translatedText, targetLocale: locale }]
        };
      }
      return m;
    });
    setMessages(threadId, updated);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <TranslateDialog
        open={!!translatingMsg}
        onOpenChange={(open) => !open && setTranslatingMsg(null)}
        messageId={translatingMsg?.id || null}
        messageContent={translatingMsg?.content || null}
        userLanguages={userLanguages}
        onTranslationComplete={handleTranslationComplete}
      />

      {/* Chat Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-10 w-10 border border-border ring-2",
            isGroup ? "ring-accent/10" : "ring-primary/10"
          )}>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback className={cn(
              "font-bold text-muted-foreground",
              isGroup ? "bg-accent/10" : "bg-muted"
            )}>
              {isGroup ? (
                <Users className="h-5 w-5 text-primary dark:text-white" />
              ) : (
                (otherUser.name || "U").substring(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">{otherUser.name || "User"}</h3>

          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn("transition-all duration-300 overflow-hidden", isSearching ? "w-64 opacity-100" : "w-0 opacity-0")}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="h-10 pl-9 bg-muted/50 border-none w-full"
                autoFocus={isSearching}
              />
            </div>
          </div>
          <div className="w-[1px] h-6 bg-border mx-1" />
          <Button
            variant={isSearching ? "secondary" : "ghost"}
            size="icon"
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery("");
            }}
            className="text-muted-foreground hover:text-foreground transition-all rounded-full h-10 w-10"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-all rounded-full h-10 w-10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ChatDoodles className="absolute inset-0 z-0 opacity-40 pointer-events-none" />
        <ScrollArea ref={scrollRef} className="h-full p-4 md:p-6 relative z-10">
          <div className="flex justify-center mb-8">
            <span className="px-5 py-1.5 rounded-full bg-muted/30 border border-border/50 text-[11px] font-semibold text-muted-foreground shadow-sm">
              Today
            </span>
          </div>

          <div className="space-y-6 w-full pb-6 px-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                translatedContent={msg.translatedContent}
                sourceLanguage={msg.sourceLanguage}
                isOwn={msg.isOwn}
                timestamp={msg.time}
                authorName={msg.author}
                authorAvatar={msg.authorAvatar || undefined}
                onRequestTranslate={() => setTranslatingMsg({ id: msg.id, content: msg.content })}
              />
            ))}
            {otherUserTyping && (
              <div className="flex gap-3 mb-4">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border flex items-center gap-1 w-16 h-10">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Composer */}
      <div className="p-6 bg-background/50 border-t border-border/50">
        <div className="w-full flex flex-col gap-2">
          {otherUserTyping && (
            <p className="text-[10px] text-muted-foreground/60 ml-4 animate-pulse">
              {otherUser.name} is typing...
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted/30 border border-border/50 rounded-2xl flex items-center p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">

              <Input
                value={inputText}
                onChange={handleInputStringChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="border-none bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground h-10 px-4 text-sm"
                disabled={isSending}
              />

              {isMounted ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-all rounded-xl h-10 w-10 shrink-0"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" side="top" align="end">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                      lazyLoadEmojis={true}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary transition-all rounded-xl h-10 w-10 shrink-0"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputText.trim() || isSending}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-300 shadow-xl shrink-0",
                inputText.trim()
                  ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                  : "bg-muted text-muted-foreground opacity-50"
              )}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-center text-[9px] text-muted-foreground/40 mt-1">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
