"use client";

import * as React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { translateMessage } from "@/actions/chat";
import { toast } from "sonner";

interface TranslateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    messageId: string | null;
    messageContent: string | null;
    userLanguages: { code: string; name: string }[];
    onTranslationComplete: (messageId: string, translatedContent: string, locale: string) => void;
}

export function TranslateDialog({
    open,
    onOpenChange,
    messageId,
    messageContent,
    userLanguages,
    onTranslationComplete,
}: TranslateDialogProps) {
    const [loadingLocale, setLoadingLocale] = React.useState<string | null>(null);

    const handleTranslate = async (targetLocale: string) => {
        if (!messageId) return;

        setLoadingLocale(targetLocale);
        try {
            const translated = await translateMessage(messageId, targetLocale);
            onTranslationComplete(messageId, translated, targetLocale);
            onOpenChange(false);
            toast.success("Translation complete");
        } catch (error) {
            toast.error("Failed to translate message");
        } finally {
            setLoadingLocale(null);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-background border-border text-text">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-text">Translate Message</AlertDialogTitle>
                    <AlertDialogDescription className="text-secondary">
                        Select a language to translate this message into.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2">
                    <div className="p-3 bg-secondary/20 rounded-lg text-sm text-secondary mb-4 max-h-32 overflow-y-auto border border-border">
                        {messageContent}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {userLanguages.map((lang) => (
                            <Button
                                key={lang.code}
                                onClick={() => handleTranslate(lang.code)}
                                variant="outline"
                                className="border-border hover:bg-secondary/10 text-secondary hover:text-text justify-start h-10"
                                disabled={!!loadingLocale}
                            >
                                {loadingLocale === lang.code ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                <span className="truncate">{lang.name}</span>
                            </Button>
                        ))}
                        {userLanguages.length === 0 && (
                            <p className="col-span-2 text-center text-xs text-secondary py-4">
                                No preferred languages set in profile.
                                <br />
                                <span className="text-[10px] mt-1 inline-block">Go to settings to add languages.</span>
                            </p>
                        )}
                    </div>
                </div>

                <AlertDialogFooter className="mt-2">
                    <AlertDialogCancel className="bg-secondary/50 border-border text-secondary hover:bg-secondary hover:text-text">
                        Cancel
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
