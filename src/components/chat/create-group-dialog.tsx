"use client";

import * as React from "react";
import { Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getConnectedUsers, createGroupThread } from "@/actions/chat";
import { useRouter } from "next/navigation";

export function CreateGroupDialog() {
  const [open, setOpen] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
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

  const toggleUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(prev => prev.filter(uid => uid !== id));
    } else {
      setSelectedUsers(prev => [...prev, id]);
    }
  };

  const handleCreate = async () => {
    if (!currentUserId || !groupName || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const threadId = await createGroupThread(currentUserId, groupName, selectedUsers);
      setOpen(false);
      router.push(`/chat/${threadId}`);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10" title="Create Group">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-400 uppercase">Group Name</Label>
            <Input
              placeholder="e.g., Marketing Team, Project Alpha"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-400 uppercase">
              Add Members ({selectedUsers.length})
            </Label>

            <div className="border border-white/10 rounded-xl bg-slate-950/50">
              <ScrollArea className="h-[200px] p-2">
                <div className="space-y-1">
                  {loading && <div className="p-4 text-center text-xs text-slate-500">Loading connections...</div>}
                  {!loading && connections.length === 0 && <div className="p-4 text-center text-xs text-slate-500">No connections available</div>}
                  {!loading && connections.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-blue-600/20" : "hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-all",
                          isSelected ? "bg-blue-600 border-blue-600" : "border-slate-600"
                        )}>
                          {isSelected && <Plus className="h-3 w-3 text-white" />}
                        </div>

                        <Avatar className="h-8 w-8 border border-white/10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-slate-800 text-slate-400 text-xs">
                            {user.name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <span className={cn("text-sm", isSelected ? "text-blue-100" : "text-slate-300")}>
                          {user.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!groupName || selectedUsers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}