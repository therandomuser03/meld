"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { assignTaskToUsers } from "@/lib/actions/tasks";
import { getConnectedUsers } from "@/actions/chat";
import { Task } from "./task-board"; // Type
import { cn } from "@/lib/utils";

interface ShareTaskDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    task: Task;
}

export function ShareTaskDialog({ open, setOpen, task }: ShareTaskDialogProps) {
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
    const [search, setSearch] = React.useState("");
    const [connections, setConnections] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const supabase = createClient();

    // Init with existing assignees
    React.useEffect(() => {
        if (open && task.assignees) {
            setSelectedUserIds(task.assignees.map(a => a.user.id));
        }
    }, [open, task]);

    // Fetch confirmed connections
    React.useEffect(() => {
        let mounted = true;
        const fetchConnections = async () => {
            if (!open) return;
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && mounted) {
                    const users = await getConnectedUsers(user.id);
                    setConnections(users);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        fetchConnections();
        return () => { mounted = false; };
    }, [open, supabase.auth]);

    const filteredUsers = connections?.filter((u: any) => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const toggleUser = (id: string) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(prev => prev.filter(uid => uid !== id));
        } else {
            setSelectedUserIds(prev => [...prev, id]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await assignTaskToUsers(task.id, selectedUserIds);
            toast.success("Task shared successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to share task");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Share Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search connections..."
                            className="pl-9 bg-secondary/50 border-transparent focus:bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[250px] pr-4">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                        ) : filteredUsers.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">No connections found.</p>
                        ) : (
                            <div className="space-y-1">
                                {filteredUsers.map((user: any) => (
                                    <div 
                                        key={user.id} 
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                            selectedUserIds.includes(user.id) ? "bg-primary/10" : "hover:bg-secondary"
                                        )}
                                        onClick={() => toggleUser(user.id)}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{user.name || "Unknown"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {selectedUserIds.includes(user.id) && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="pt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
