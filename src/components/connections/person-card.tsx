"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { getOrCreateDirectThread } from "@/actions/chat";

interface PersonCardProps {
    user: {
        id: string;
        name: string | null;
        profession: string | null;
        bio: string | null;
        avatarUrl: string | null;
        mutualCount?: number;
    };
    status?: "NONE" | "PENDING" | "CONNECTED"; // Derived from DB check
    currentUserId?: string;
}

export function PersonCard({ user, status = "NONE", currentUserId }: PersonCardProps) {
    const [currentStatus, setCurrentStatus] = useState(status);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/connections/request", {
                method: "POST",
                body: JSON.stringify({ toUserId: user.id }),
            });
            if (!res.ok) throw new Error();

            setCurrentStatus("PENDING");
            toast.success(`Request sent to ${user.name}`);
        } catch (e) {
            toast.error("Failed to send request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!currentUserId) return;
        setIsLoading(true);
        try {
            const threadId = await getOrCreateDirectThread(currentUserId, user.id);
            router.push(`/chat/${threadId}`);
        } catch (error) {
            toast.error("Failed to start conversation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="group dark:bg-slate-900/50 bg-white/80 backdrop-blur-xl border dark:border-white/10 border-slate-200 hover:border-blue-500/30 p-6 rounded-2xl flex flex-col items-center text-center transition-all shadow-sm hover:shadow-md">
            <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-2 dark:border-slate-800 border-white shadow-xl">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-600 text-xl">
                        {user.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {/* Online Indicator Mock */}
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 dark:border-slate-900 border-white" />
            </div>

            <h3 className="font-bold dark:text-white text-slate-900 text-lg mb-1 line-clamp-1">{user.name}</h3>
            <p className="text-sm text-blue-500 font-medium mb-3 line-clamp-1">
                {user.profession || "Member"}
            </p>

            <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 mb-4 h-8 px-2">
                {user.bio?.trim() ? user.bio : "Not Available"}
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-6 dark:bg-white/5 bg-slate-100 px-3 py-1 rounded-full border dark:border-white/5 border-slate-200">
                <Users className="h-3 w-3" />
                <span>{user.mutualCount ? `${user.mutualCount} Mutual Connections` : "No Mutual Connections"}</span>
            </div>

            <div className="mt-auto w-full">
                {currentStatus === "CONNECTED" ? (
                    <Button
                        onClick={handleMessage}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        <MessageSquare className="h-4 w-4" /> Message
                    </Button>
                ) : currentStatus === "PENDING" ? (
                    <Button disabled variant="secondary" className="w-full dark:bg-white/5 bg-slate-100 text-slate-400 gap-2">
                        <Clock className="h-4 w-4" /> Pending
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full dark:border-white/10 border-slate-200 dark:text-white text-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white gap-2 group-hover:border-blue-500/50 group-hover:text-blue-500"
                    >
                        <UserPlus className="h-4 w-4" /> Connect
                    </Button>
                )}
            </div>
        </div>
    );
}
