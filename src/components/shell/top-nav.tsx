"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopNav() {
    const router = useRouter();
    const pathname = usePathname();

    // Helper to get efficient page title
    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Dashboard";
        if (path.startsWith("/chat")) return "Chat";
        if (path.startsWith("/notes")) return "Notes";
        if (path.startsWith("/tasks")) return "Tasks";
        if (path.startsWith("/connections")) return "Connections";
        if (path.startsWith("/settings")) return "Settings";
        return "";
    };

    const title = getPageTitle(pathname || "");

    if (!title && !pathname?.startsWith("/chat") && !pathname?.startsWith("/notes")) return null; // Don't show on unknown pages ideally, or default to something

    return (
        <div className="flex items-center gap-4 mb-6">
            {/* Navigation Controls */}
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-md"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.forward()}
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-md"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Pages Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">App</span>
                <span className="text-slate-700 dark:text-slate-700">/</span>
                <span className="text-slate-200 font-medium">{title}</span>
            </div>
        </div>
    );
}
