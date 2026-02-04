"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateOnboardingLanguages, completeOnboarding } from "@/lib/actions/onboarding";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const schema = z.object({
    languages: z.array(z.string()).min(1, "Select at least one language"),
});

type Values = z.infer<typeof schema>;

interface Props {
    languages: { id: string; nameEnglish: string; nativeName: string | null; }[];
}

export function LanguagesForm({ languages }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { errors },
    } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: {
            languages: []
        }
    });

    const selected = watch("languages");

    const toggleLanguage = (id: string) => {
        const current = selected || [];
        if (current.includes(id)) {
            setValue("languages", current.filter(l => l !== id));
        } else {
            setValue("languages", [...current, id]);
        }
    };

    async function onSubmit(data: Values) {
        setIsLoading(true);
        try {
            const result = await updateOnboardingLanguages(data);
            if (result.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            // Complete onboarding - the redirect within this action should be allowed to propagate
            const completeResult = await completeOnboarding();

            // If it returns (meaning no redirect happened), check for error
            if (completeResult?.error) {
                toast.error(completeResult.error);
                setIsLoading(false);
            }
        } catch (error) {
            // Next.js redirect errors have a 'digest' property starting with 'NEXT_REDIRECT'
            // We should only toast if it's a real error.
            if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
                return;
            }

            console.error("Onboarding error:", error);
            toast.error("An unexpected error occurred during setup.");
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[300px] border border-white/10 rounded-md p-4 bg-white/5">
                <div className="grid grid-cols-2 gap-2">
                    {languages.map(lang => (
                        <div
                            key={lang.id}
                            onClick={() => toggleLanguage(lang.id)}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border text-sm",
                                selected.includes(lang.id)
                                    ? "bg-blue-600/20 border-blue-500/50 text-white"
                                    : "bg-transparent border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-white">{lang.nameEnglish}</span>
                                <span className="text-xs opacity-70">{lang.nativeName}</span>
                            </div>
                            {selected.includes(lang.id) && <Check className="h-4 w-4 text-blue-400" />}
                        </div>
                    ))}
                </div>
            </ScrollArea>
            {errors.languages && <p className="text-xs text-red-500 text-center">{errors.languages.message}</p>}

            <Button disabled={isLoading || selected.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Setup
            </Button>
        </form>
    );
}
