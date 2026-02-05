import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { NavigationBreadcrumb } from "@/components/common/navigation-breadcrumb";
import { formatDistanceToNow } from "date-fns";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ActivityPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    // Fetch notifications
    const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.notification.count({
            where: { userId: user.id },
        }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Pagination helper to generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Navigation Breadcrumb */}
            <NavigationBreadcrumb pageName="Activity" />

            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold dark:text-white text-slate-900">Activity History</h1>
                <p className="dark:text-slate-400 text-slate-500">View all your past notifications and activities.</p>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={cn(
                                "flex items-start gap-4 p-5 rounded-2xl border transition-all",
                                "dark:bg-slate-900/50 bg-white dark:border-white/5 border-slate-200",
                                !notif.readAt ? "dark:border-blue-500/30 border-blue-500/30 dark:bg-blue-500/5 bg-blue-50" : "hover:border-blue-500/20"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                !notif.readAt ? "bg-blue-500/10 text-blue-500" : "dark:bg-white/5 bg-slate-100 text-slate-500"
                            )}>
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className={cn("font-semibold text-sm", !notif.readAt ? "dark:text-white text-slate-900" : "dark:text-slate-300 text-slate-700")}>
                                        {notif.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                                {notif.body && (
                                    <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
                                        {notif.body}
                                    </p>
                                )}
                            </div>
                            {!notif.readAt && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 dark:bg-slate-900/20 bg-slate-50 rounded-3xl border border-dashed dark:border-white/5 border-slate-200">
                        <div className="h-12 w-12 rounded-full dark:bg-white/5 bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3">
                            <Bell className="h-6 w-6" />
                        </div>
                        <p className="text-slate-500">No activity history found.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 pt-4 border-t dark:border-white/5 border-slate-200">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={page > 1 ? `/activity?page=${page - 1}` : undefined}
                                    className={cn(page <= 1 && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>

                            {getPageNumbers().map((p, i) => (
                                <PaginationItem key={i}>
                                    {p === "..." ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            href={`/activity?page=${p}`}
                                            isActive={page === p}
                                        >
                                            {p}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href={page < totalPages ? `/activity?page=${page + 1}` : undefined}
                                    className={cn(page >= totalPages && "pointer-events-none opacity-50")}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
