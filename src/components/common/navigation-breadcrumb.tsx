"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationBreadcrumbProps {
    pageName: string;
    className?: string;
}

export function NavigationBreadcrumb({ pageName, className }: NavigationBreadcrumbProps) {
    const router = useRouter();

    return (
        <div className={cn("mb-6", className)}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center p-1 rounded-sm hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Go back"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </BreadcrumbItem>

                    <BreadcrumbItem>
                        <button
                            onClick={() => router.forward()}
                            className="flex items-center justify-center p-1 rounded-sm hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Go forward"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </BreadcrumbItem>

                    {/* <BreadcrumbSeparator className="ml-2" /> */}

                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            Meld
                        </BreadcrumbLink>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-foreground font-medium">
                            {pageName}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
