import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ContentSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    rows?: number
    className?: string
}

export function ContentSkeleton({ rows = 3, className, ...props }: ContentSkeletonProps) {
    return (
        <div className={cn("space-y-3", className)} {...props}>
            <Skeleton className="h-4 w-[250px]" />
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-[200px]" />
        </div>
    )
}
