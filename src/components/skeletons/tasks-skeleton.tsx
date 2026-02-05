import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TasksSkeleton() {
    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Breadcrumb & Header */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Board Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-hidden">
                {Array.from({ length: 3 }).map((_, colIndex) => (
                    <div key={colIndex} className="bg-secondary/30 rounded-lg p-4 flex flex-col space-y-4 h-full">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>

                        <div className="space-y-3 overflow-hidden">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="bg-background">
                                    <CardContent className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
