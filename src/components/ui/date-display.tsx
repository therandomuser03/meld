"use client";

import { useEffect, useState } from "react";

interface DateDisplayProps {
    date: string | Date;
    format?: "relative" | "time" | "date" | "datetime";
    className?: string;
}

export function DateDisplay({ date, format = "relative", className }: DateDisplayProps) {
    const [formatted, setFormatted] = useState<string>("");

    useEffect(() => {
        if (!date) return;
        const d = new Date(date);
        const now = new Date();

        if (format === "time") {
            setFormatted(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        } else if (format === "date") {
            setFormatted(d.toLocaleDateString());
        } else if (format === "datetime") {
            setFormatted(d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }));
        } else {
            // Relative logic
            const diff = now.getTime() - d.getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (seconds < 60) {
                setFormatted("Just now");
            } else if (minutes < 60) {
                setFormatted(`${minutes}m ago`);
            } else if (hours < 24 && d.getDate() === now.getDate()) {
                setFormatted(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
            } else if (days < 2) {
                setFormatted("Yesterday");
            } else if (days < 7) {
                setFormatted(d.toLocaleDateString([], { weekday: 'long' }));
            } else {
                setFormatted(d.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            }
        }
    }, [date, format]);

    // Render a placeholder or empty string during SSR to avoid hydration mismatch
    // Using a suppressHydrationWarning wrapper could allow us to render a best-guess server side, 
    // but for local time precision, client-only render is safer.
    if (!formatted) return <span className={className}>...</span>;

    return <span className={className}>{formatted}</span>;
}
