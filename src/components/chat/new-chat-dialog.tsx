"use client";

import * as React from "react";
import { MessageSquarePlus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getConnectedUsers, getOrCreateDirectThread } from "@/actions/chat";

export function NewChatDialog({ emptyState }: { emptyState?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [connections, setConnections] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchConnections() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const users = await getConnectedUsers(user.id);
        setConnections(users);
      }
      setLoading(false);
    }

    if (open) {
      fetchConnections();
    }
  }, [open]);

  const filtered = connections.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const startChat = async (userId: string) => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const threadId = await getOrCreateDirectThread(currentUserId, userId);
      setOpen(false);
      router.push(`/chat/${threadId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {emptyState ? (
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="h-5 w-5" />
            {loading ? "Loading..." : "Start New Chat"}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="New Direct Message">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Suggested</p>
              {loading ? (
                <div className="text-center py-4 text-slate-500 text-xs">Loading connections...</div>
              ) : (
                <>
                  {filtered.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startChat(user.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group text-left"
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.name?.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.role}
                        </p>
                      </div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No connections found.
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}