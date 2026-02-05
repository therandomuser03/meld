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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
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
                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-5 w-5 rounded-full border flex items-center justify-center transition-colors duration-200",
                                    isSelected
                                        ? "bg-primary border-primary text-white"
                                        : "border-slate-500 group-hover:border-slate-400"
                                )}
                            >
                                {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        isSelected ? "text-primary shadow-sm" : "text-slate-200"
                                    )}
                                >
                                    {language.nameEnglish}
                                </span>
                                {language.nativeName && (
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
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
