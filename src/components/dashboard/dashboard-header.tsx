"use client";

import { useTranslation } from "react-i18next";

export function DashboardHeader({ firstName, date }: { firstName: string; date: string }) {
    const hour = new Date().getHours();
    let greetingId = "dashboard.greeting.evening";
    if (hour < 12) greetingId = "dashboard.greeting.morning";
    else if (hour < 18) greetingId = "dashboard.greeting.afternoon";
    const { t } = useTranslation();

    return (
        <div className="space-y-1 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t(greetingId)}, {firstName}!
            </h1>
            <p className="text-muted-foreground">
                Here&apos;s your activity summary for {date}
            </p>
        </div>
    );
}
