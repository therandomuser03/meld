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
    <div className="w-80 border-r dark:border-white/10 border-black/5 dark:bg-slate-950 bg-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white text-slate-900">Chats</h2>
        <div className="flex items-center gap-1">
          <NewChatDialog />
          <CreateGroupDialog />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search contacts..."
            className="dark:bg-slate-900 bg-slate-100 dark:border-white/10 border-black/5 pl-9 dark:text-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-blue-600 rounded-xl"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
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
                  "flex gap-3 p-3 mx-2 rounded-xl transition-all cursor-pointer group",
                  isActive ? "dark:bg-white/5 bg-white/50 shadow-sm" : "dark:hover:bg-white/5 hover:bg-black/5"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 dark:border-white/10 border-black/5">
                    <AvatarImage src={thread.avatar} />
                    <AvatarFallback className="dark:bg-slate-800 bg-slate-300 dark:text-slate-300 text-slate-600">
                      {thread.type === 'ROOM' ? (
                        <Users className="h-5 w-5 dark:text-slate-400 text-slate-600" />
                      ) : (
                        thread.fallback
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {thread.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 dark:border-slate-950 border-white" />
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={cn("font-medium truncate text-sm", isActive ? "dark:text-white text-blue-600" : "dark:text-slate-300 text-slate-700")}>
                      {thread.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      <DateDisplay date={thread.updatedAt} format="relative" />
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs truncate",
                    thread.unread ? "text-blue-400 font-medium" : "dark:text-slate-500 text-slate-500"
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