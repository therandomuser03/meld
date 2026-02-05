import { Skeleton } from "@/components/ui/skeleton";

export function NotesSkeleton() {
    return (
        <div className="h-full flex flex-col p-6 space-y-4">
            {/* Toolbar/Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Editor Area */}
            <div className="space-y-4 pt-4 max-w-3xl mx-auto w-full">
                <Skeleton className="h-10 w-3/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-2 pt-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
    );
}

export function NoteSidebarSkeleton() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-3 space-y-2 border rounded-lg">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    )
}
