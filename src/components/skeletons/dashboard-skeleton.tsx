import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-64" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                {/* Pinned Notes Skeleton */}
                <Card className="h-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pending Tasks Skeleton */}
                <Card className="h-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-5 w-5 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
