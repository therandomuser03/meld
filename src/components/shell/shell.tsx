"use client";

import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";

interface ShellProps {
    children: React.ReactNode;
    userProfile: any;
}

export function Shell({ children, userProfile }: ShellProps) {
    const { isCollapsed } = useSidebar();
    const pathname = usePathname();
    const isFullWidthPage = pathname?.startsWith("/chat") || pathname?.startsWith("/notes") || pathname?.startsWith("/tasks");

    return (
        <>
            <Sidebar user={userProfile} />
            <main
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out",
                    isCollapsed ? "pl-20" : "pl-64"
                )}
            >
                <div
                    className={cn(
                        "transition-all",
                        isFullWidthPage ? "p-0 max-w-none h-screen bg-background w-full" : "container mx-auto p-6 md:p-8 max-w-7xl"
                    )}
                >
                    {children}
                </div>
            </main>
        </>
    );
}
