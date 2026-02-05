"use client";

import { Bell, Check, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    body: string | null;
    createdAt: Date;
    readAt: Date | null;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
}

export function NotificationDropdown({ notifications, unreadCount }: NotificationDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 h-2 w-2 bg-blue-500 rounded-full border dark:border-slate-900 border-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 p-0 overflow-hidden shadow-2xl">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="font-bold">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
                            {unreadCount} new
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-white/5 bg-slate-100" />

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className="p-4 flex flex-col items-start gap-1 dark:focus:bg-white/5 focus:bg-slate-50 cursor-pointer border-b dark:border-white/5 border-slate-100 last:border-0"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-sm font-semibold">{notif.title}</span>
                                    {!notif.readAt && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                                </div>
                                {notif.body && <p className="text-xs dark:text-slate-400 text-slate-500 line-clamp-2 leading-relaxed">{notif.body}</p>}
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                            <div className="h-10 w-10 rounded-full dark:bg-white/5 bg-slate-100 flex items-center justify-center text-slate-500">
                                <Bell className="h-5 w-5" />
                            </div>
                            <p className="text-sm text-slate-500">No new notifications</p>
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator className="dark:bg-white/5 bg-slate-100" />
                <DropdownMenuItem asChild>
                    <a href="/activity" className="w-full p-3 text-center justify-center text-xs font-medium text-blue-500 focus:text-blue-600 dark:focus:bg-white/5 focus:bg-slate-50 cursor-pointer block">
                        View all activity
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
