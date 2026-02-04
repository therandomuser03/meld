"use client";

import { useTranslation } from "react-i18next";

export function DashboardHeader({ firstName, date }: { firstName: string; date: string }) {
    const hour = new Date().getHours();
    let greetingId = "dashboard.greeting.evening";
    if (hour < 12) greetingId = "dashboard.greeting.morning";
    else if (hour < 18) greetingId = "dashboard.greeting.afternoon";
    const { t } = useTranslation();

    return (
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight dark:text-white text-slate-900 text-glow">
                {t(greetingId)}, {firstName}
            </h1>
            <p className="dark:text-slate-400 text-slate-600">
                {t("dashboard.overview", { date })}
            </p>
        </div>
    );
}
