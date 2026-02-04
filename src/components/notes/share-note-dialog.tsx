"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Check, Copy, Users, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleNoteVisibility, shareNoteWithUsers } from "@/lib/actions/share";
import { getConnectedUsers } from "@/actions/chat";

interface ShareNoteDialogProps {
    noteId: string;
    initialVisibility: "PRIVATE" | "ROOM" | "SHARED";
    initialSharedWith: string[]; // User IDs
    currentUser: { id: string };
}

export function ShareNoteDialog({ noteId, initialVisibility, initialSharedWith, currentUser }: ShareNoteDialogProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isPublic, setIsPublic] = React.useState(initialVisibility === "SHARED");
    const [selectedUsers, setSelectedUsers] = React.useState<string[]>(initialSharedWith);
    const [connections, setConnections] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Fetch connections when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            // Assuming we can call the server action directly here
            getConnectedUsers(currentUser.id).then(setConnections);
        }
    }, [isOpen, currentUser.id]);

    const handleVisibilityToggle = async (checked: boolean) => {
        setIsPublic(checked);
        // Optimistic UI handled, but should handle error?
        try {
            await toggleNoteVisibility(noteId, checked);
            toast.success(checked ? "Note is now shareable" : "Note is now private");
        } catch (e) {
            setIsPublic(!checked); // Revert
            toast.error("Failed to update visibility");
        }
    };

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleShare = async () => {
        setIsLoading(true);
        try {
            await shareNoteWithUsers(noteId, selectedUsers);
            toast.success("Updated shared users!");

            // System share logic
            const url = `${window.location.origin}/notes/${noteId}`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Check out this note',
                        text: 'Sharing a note from Meld',
                        url: url
                    });
                } catch (e) {
                    // User cancelled or not supported fully
                    fallbackCopy(url);
                }
            } else {
                fallbackCopy(url);
            }
            setIsOpen(false);
        } catch (e) {
            toast.error("Failed to share");
        } finally {
            setIsLoading(false);
        }
    };

    const fallbackCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white gap-2">
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle>Share Note</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Control who can see this note.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-4 py-4">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="public-mode" className="text-base font-medium text-white">
                            Shareable
                        </Label>
                        <p className="text-sm text-slate-400">
                            Allow selected users to view this note.
                        </p>
                    </div>
                    <Switch
                        id="public-mode"
                        checked={isPublic}
                        onCheckedChange={handleVisibilityToggle}
                    />
                </div>

                {isPublic && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                Share with
                            </Label>
                            <ScrollArea className="h-[200px] rounded-md border border-white/10 p-2">
                                {connections.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-8">No connections found.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {connections.map(user => {
                                            const isSelected = selectedUsers.includes(user.id);
                                            return (
                                                <div
                                                    key={user.id}
                                                    onClick={() => handleToggleUser(user.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                                        isSelected ? "bg-blue-600/20" : "hover:bg-white/5"
                                                    )}
                                                >
                                                    <div className="relative">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatarUrl} />
                                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {isSelected && (
                                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-slate-900">
                                                                <Check className="h-2 w-2 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className={cn("text-sm font-medium truncate", isSelected ? "text-blue-400" : "text-white")}>
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            {user.email || user.profession}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                        <DialogFooter className="sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2"
                                onClick={handleShare}
                                disabled={isLoading}
                            >
                                {isLoading ? "Sharing..." : (
                                    <>
                                        <Share2 className="h-4 w-4" />
                                        Share & Copy Link
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
