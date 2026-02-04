"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "zh", label: "繁體中文" },
]

export function LanguageSelector() {
    const { locale, setLocale } = useLanguage()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-black/5 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors">
                    <Languages className="h-[1.1rem] w-[1.1rem]" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-slate-950 bg-white dark:border-white/10 border-black/5 dark:text-slate-200 text-slate-900">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className={`dark:focus:bg-white/10 focus:bg-slate-100 dark:focus:text-white focus:text-slate-900 cursor-pointer ${locale === lang.code ? "dark:bg-white/5 bg-slate-50 dark:text-white text-slate-900 font-medium" : ""}`}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
