"use client";

import * as React from "react";
import { Check, Search, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LANGUAGES, getSortedLanguages } from "@/lib/i18n/languages";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LanguageSelectorProps {
  userCountryCode?: string | null;
  userId: string;
}

export function LanguageSelector({ userCountryCode, userId }: LanguageSelectorProps) {
  const [selected, setSelected] = React.useState<string>("en");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Sort languages: Region matches first
  const sortedLanguages = React.useMemo(() => {
    return getSortedLanguages(userCountryCode);
  }, [userCountryCode]);

  // Filter by search
  const filteredLanguages = sortedLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  // Group into "Suggested" vs "All" if user has a country code
  const suggested = userCountryCode 
    ? filteredLanguages.filter(l => l.regionCodes?.includes(userCountryCode)) 
    : [];
  const others = userCountryCode 
    ? filteredLanguages.filter(l => !l.regionCodes?.includes(userCountryCode)) 
    : filteredLanguages;

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // 1. Update Profile with preferred locale
      const { error: profileError } = await supabase
        .from("UserProfile")
        .update({ preferredReadingLocale: selected })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 2. Also add to UserLanguage table (as a READ language)
      // We upsert to avoid duplicates if they click multiple times
      /* Note: In a real app, you'd lookup the Language ID from the DB first.
         For this prototype, assuming we might need to seed the Language table first.
         Skipping strict relation insert for simplicity, focusing on Profile update.
      */

      toast.success("Profile updated!");
      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to save preference.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search languages..."
          className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-6">
          
          {/* Suggested Section (only if relevant) */}
          {suggested.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-3 w-3" /> Suggested for your region
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {suggested.map((lang) => (
                  <LanguageBadge 
                    key={lang.code} 
                    lang={lang} 
                    isSelected={selected === lang.code} 
                    onClick={() => setSelected(lang.code)} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* All/Others Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {suggested.length > 0 ? "Other Languages" : "All Languages"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {others.map((lang) => (
                 <LanguageBadge 
                    key={lang.code} 
                    lang={lang} 
                    isSelected={selected === lang.code} 
                    onClick={() => setSelected(lang.code)} 
                  />
              ))}
            </div>
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
                No languages found.
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pt-2">
        <Button 
            onClick={handleFinish} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
            {isLoading ? "Setting up workspace..." : "Finish Setup"} 
        </Button>
        <p className="text-xs text-center text-slate-500 mt-3">
            This will be the default language for your generated reports and interface.
        </p>
      </div>
    </div>
  );
}

function LanguageBadge({ lang, isSelected, onClick }: { lang: any, isSelected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200",
                isSelected 
                    ? "bg-blue-600/20 border-blue-600/50 shadow-[0_0_15px_-3px_rgba(37,99,235,0.3)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            )}
        >
            <div className="flex justify-between w-full mb-1">
                <span className="text-lg">{lang.flag}</span>
                {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                )}
            </div>
            <span className={cn("text-sm font-medium", isSelected ? "text-blue-200" : "text-slate-200")}>
                {lang.name}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-slate-400">
                {lang.nativeName}
            </span>
        </button>
    )
}