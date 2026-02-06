"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Language = {
    id: string;
    nameEnglish: string;
    nativeName?: string | null;
};

interface LanguagePickerProps {
    languages: Language[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    className?: string;
}

export function LanguagePicker({
    languages,
    selectedIds,
    onChange,
    className,
}: LanguagePickerProps) {
    const toggleLanguage = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <ScrollArea className={cn("h-full w-full pr-4", className)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
                {languages.map((language) => {
                    const isSelected = selectedIds.includes(language.id);
                    return (
                        <div
                            key={language.id}
                            onClick={() => toggleLanguage(language.id)}
                            className={cn(
                                "group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                                isSelected
                                    ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                                    : "bg-background/50 border-input hover:bg-muted hover:border-muted-foreground/20"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-5 w-5 rounded-full border flex items-center justify-center transition-colors duration-200",
                                    isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-muted-foreground group-hover:border-foreground"
                                )}
                            >
                                {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        isSelected ? "text-primary shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                >
                                    {language.nameEnglish}
                                </span>
                                {language.nativeName && (
                                    <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                                        {language.nativeName}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
