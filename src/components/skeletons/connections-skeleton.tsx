import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ConnectionsSkeleton() {
    return (
        <div className="space-y-8 pb-10">
            <Skeleton className="h-4 w-24" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Search Bar */}
            <Skeleton className="h-10 w-full md:w-1/2" />

            {/* Tabs */}
            <div className="flex space-x-4 border-b pb-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="h-24 bg-muted animate-pulse" />
                        <CardContent className="p-6 pt-0 mt-[-3rem] flex flex-col items-center text-center space-y-3">
                            <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="w-full pt-4">
                                <Skeleton className="h-9 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
