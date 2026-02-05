"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface InvitationCardProps {
    request: {
        id: string;
        fromUser: {
            id: string;
            name: string | null;
            profession: string | null;
            avatarUrl: string | null;
            mutualCount?: number;
        };
    };
}

export function InvitationCard({ request }: InvitationCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAction = async (action: 'accept' | 'reject') => {
        setIsLoading(true);
        try {
            // API call to /api/connections/respond
            const res = await fetch("/api/connections/respond", {
                method: "POST",
                body: JSON.stringify({ requestId: request.id, action }),
            });

            if (!res.ok) throw new Error();

            toast.success(action === 'accept' ? "Connection accepted!" : "Request declined");
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark:bg-slate-900/50 bg-white/50 border dark:border-white/10 border-black/5 p-4 rounded-xl flex items-center gap-4 min-w-[320px] shadow-sm">
            <Avatar className="h-12 w-12 border dark:border-white/10 border-black/5">
                <AvatarImage src={request.fromUser.avatarUrl || ""} />
                <AvatarFallback className="dark:bg-slate-800 bg-slate-200 dark:text-slate-300 text-slate-600">
                    {request.fromUser.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold dark:text-white text-slate-900 truncate">
                    {request.fromUser.name}
                </h4>
                <p className="text-xs dark:text-slate-400 text-slate-600 truncate mb-1">
                    {request.fromUser.profession || "SetChat User"}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Users className="h-3 w-3" />
                    <span>{request.fromUser.mutualCount ? `${request.fromUser.mutualCount} mutual connections` : 'No mutual connections'}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    size="sm"
                    onClick={() => handleAction('accept')}
                    disabled={isLoading}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10"
                >
                    Accept
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction('reject')}
                    disabled={isLoading}
                    className="h-7 text-xs dark:text-slate-400 text-slate-600 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors"
                >
                    Decline
                </Button>
            </div>
        </div>
    );
}
