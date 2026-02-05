"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NewChatDialog } from "@/components/chat/new-chat-dialog";
import { CreateGroupDialog } from "@/components/chat/create-group-dialog";
import { DateDisplay } from "@/components/ui/date-display";
import { getUserThreads } from "@/actions/chat";
import { useChatStore } from "@/lib/store/chat-store";
import { useThreadsRealtime } from "@/hooks/use-chat-realtime";

interface ThreadListProps {
  initialThreads?: any[];
  currentUserId: string;
}

export function ThreadList({ initialThreads = [], currentUserId }: ThreadListProps) {
  const { threads: storeThreads, setThreads } = useChatStore();
  const params = useParams();
  const activeId = params.threadId;

  // Sync with server props
  React.useEffect(() => {
    if (initialThreads.length > 0) {
      setThreads(initialThreads);
    }
  }, [initialThreads, setThreads]);

  useThreadsRealtime(currentUserId);

  // Transform threads for display
  const threads = storeThreads.map(t => {
    // Determine the "other" participant or room details
    let name = "Unknown";
    let avatar = "";
    let isOnline = false; // TODO: Implement online status

    if (t.type === "DIRECT") {
      const otherUser = t.userAId === currentUserId ? t.userB : t.userA;
      name = otherUser?.name || "Unknown User";
      avatar = otherUser?.avatarUrl;
    } else {
      name = t.room?.name || "Group";
    }

    const lastMsg = t.messages?.[0];

    return {
      id: t.id,
      type: t.type,
      name,
      avatar,
      lastMessage: lastMsg ? (lastMsg.content || "Sent an attachment") : "No messages yet",
      updatedAt: t.updatedAt,
      unread: false, // TODO: Implement unread count logic in store
      online: isOnline,
      fallback: name.substring(0, 2).toUpperCase()
    };
  });

  return (
    <div className="w-80 border-r border-border flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Chats</h2>
        <div className="flex items-center gap-2">
          <NewChatDialog />
          {/* CreateGroupDialog is removed or moved if not in reference, but keeping for functionality */}
          <CreateGroupDialog />
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="bg-background border-none pl-9 py-6 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = activeId === thread.id;

            return (
              <Link
                key={thread.id}
                href={`/chat/${thread.id}`}
                className={cn(
                  "flex gap-4 p-4 rounded-3xl transition-all cursor-pointer group",
                  isActive
                    ? "bg-bg-900 shadow-lg border border-border/50 translate-x-1"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-border/50">
                    <AvatarImage src={thread.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                      {thread.type === 'ROOM' ? (
                        <Users className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        thread.fallback
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {thread.online && (
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-secondary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={cn(
                      "font-semibold truncate text-base",
                      isActive ? "text-text-50" : "text-foreground"
                    )}>
                      {thread.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                      <DateDisplay date={thread.updatedAt} format="relative" />
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm truncate",
                    thread.unread ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {thread.lastMessage}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}