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
// import { ScrollArea } from "@/components/ui/scroll-area"; // Removed as LanguagePicker has its own scroll area logic or we wrap it


const schema = z.object({
    languages: z.array(z.string()).min(1, "Select at least one language"),
});

type Values = z.infer<typeof schema>;

import { LanguagePicker, Language } from "@/components/ui/language-picker";

interface Props {
    languages: Language[];
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
            <div className="border border-white/5 rounded-xl p-4 bg-white/5 backdrop-blur-sm shadow-inner min-h-[400px]">
                <LanguagePicker
                    languages={languages}
                    selectedIds={selected}
                    onChange={(ids) => setValue("languages", ids, { shouldValidate: true })}
                    className="h-full"
                />
            </div>
            {errors.languages && <p className="text-xs text-red-400 text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">{errors.languages.message}</p>}

            <Button disabled={isLoading || selected.length === 0} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish Setup
            </Button>
        </form>
    );
}
