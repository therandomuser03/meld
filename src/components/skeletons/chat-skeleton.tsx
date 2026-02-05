import { Skeleton } from "@/components/ui/skeleton";

export function ChatListSkeleton() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ChatMessageSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex items-end space-x-2 max-w-[70%] ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className={`h-12 w-32 rounded-lg ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                    </div>
                </div>
            ))}
        </div>
    )
}
