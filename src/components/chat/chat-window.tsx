"use client";

import * as React from "react";
import { sendMessage, getThreadMessages, markThreadAsRead } from "@/actions/chat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreVertical, Search, Send, Smile, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/message-bubble";
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
  const { messages: storeMessages, setMessages } = useChatStore();
  const [inputText, setInputText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  // Translation state
  const [translatingMsg, setTranslatingMsg] = React.useState<{ id: string, content: string } | null>(null);

  // Typing state
  const [otherUserTyping, setOtherUserTyping] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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


  const messages = threadMessages.map(msg => ({
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
      await sendMessage(threadId, currentUserId, inputText.trim());
      setInputText("");
      router.refresh();
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
    <div className="flex flex-col h-full dark:bg-slate-950/50 bg-slate-200/50">
      <TranslateDialog
        open={!!translatingMsg}
        onOpenChange={(open) => !open && setTranslatingMsg(null)}
        messageId={translatingMsg?.id || null}
        messageContent={translatingMsg?.content || null}
        userLanguages={userLanguages}
        onTranslationComplete={handleTranslationComplete}
      />

      {/* Chat Header */}
      <header className="h-16 border-b dark:border-white/10 border-black/5 flex items-center justify-between px-6 dark:bg-slate-950/80 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "h-10 w-10 border dark:border-white/10 border-black/5 ring-2",
            isGroup ? "ring-purple-500/10" : "ring-blue-500/10"
          )}>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback className={cn(
              "font-bold dark:text-slate-300 text-slate-600",
              isGroup ? "bg-purple-900/50" : "dark:bg-slate-800 bg-slate-300"
            )}>
              {isGroup ? (
                <Users className="h-5 w-5 text-purple-400" />
              ) : (
                (otherUser.name || "U").substring(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">{otherUser.name || "User"}</h3>
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-[10px] font-medium uppercase tracking-wider",
                isGroup ? "text-purple-400" : "text-blue-500 font-bold"
              )}>
                {isGroup ? "Group Message" : "Direct Message"}
              </p>
              {otherUserTyping && (
                <span className="text-[10px] dark:text-slate-400 text-slate-500 animate-pulse flex items-center gap-1">
                  • typing...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 transition-colors">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea ref={scrollRef} className="h-full p-6">
          <div className="flex justify-center mb-8">
            <span className="px-3 py-1 rounded-full dark:bg-slate-900/50 bg-white/50 border dark:border-white/5 border-black/5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Conversation Started
            </span>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto pb-6">
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
                <div className="dark:bg-slate-900/50 bg-white/50 p-3 rounded-2xl rounded-tl-none border dark:border-white/5 border-black/5 flex items-center gap-1 w-16 h-10">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Composer */}
      <div className="p-4 dark:bg-slate-950/80 bg-white/80 backdrop-blur-md border-t dark:border-white/10 border-black/5">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="flex-1 dark:bg-slate-900/50 bg-slate-100 border dark:border-white/10 border-black/5 rounded-2xl flex items-center p-1.5 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <Input
              value={inputText}
              onChange={handleInputStringChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="border-none bg-transparent focus-visible:ring-0 dark:text-slate-200 text-slate-900 placeholder:text-slate-500 h-10 px-3"
              disabled={isSending}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-blue-400 hover:bg-transparent"
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
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className={cn(
              "h-11 w-11 rounded-full transition-all duration-300 shadow-lg",
              inputText.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
            )}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
