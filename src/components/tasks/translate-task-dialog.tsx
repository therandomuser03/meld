"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Languages, Globe } from "lucide-react";
import { toast } from "sonner";
import { translateTaskAction, getUserLanguages } from "@/lib/actions/tasks";
import { Task } from "./task-board"; 

interface TranslateTaskDialogProps {
    open: boolean;
    setOpen: (o: boolean) => void;
    task: Task;
}

export function TranslateTaskDialog({ open, setOpen, task }: TranslateTaskDialogProps) {
    const [targetLang, setTargetLang] = React.useState("");
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [result, setResult] = React.useState<string | null>(null);
    const [languages, setLanguages] = React.useState<{value: string, label: string}[]>([]);
    const [isLoadingLanguages, setIsLoadingLanguages] = React.useState(false);

    // Fetch user languages on open
    React.useEffect(() => {
        let mounted = true;
        const fetchLangs = async () => {
             if (open) {
                 setIsLoadingLanguages(true);
                 try {
                     const langs = await getUserLanguages();
                     if (mounted) {
                         setLanguages(langs);
                         if (langs.length > 0) {
                             setTargetLang(langs[0].value);
                         }
                     }
                 } catch (e) {
                     console.error(e);
                 } finally {
                     if (mounted) setIsLoadingLanguages(false);
                 }
             }
        };
        fetchLangs();
        return () => { mounted = false; };
    }, [open]);

    const handleTranslate = async () => {
        if (!targetLang) return;
        setIsTranslating(true);
        setResult(null);
        try {
            const res = await translateTaskAction(task.id, targetLang);
            if (res?.translatedContent) {
                setResult(res.translatedContent);
            }
        } catch (error) {
            toast.error("Translation failed");
        } finally {
            setIsTranslating(false);
        }
    };

    // Reset on close/open
    React.useEffect(() => {
        if (!open) setResult(null);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-primary" />
                        Translate Task
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Target Language</Label>
                        {isLoadingLanguages ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading languages...
                            </div>
                        ) : languages.length > 0 ? (
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(l => (
                                        <SelectItem key={l.value} value={l.value}>
                                            {l.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-destructive">
                                No preferred languages found. Please add languages in your profile.
                            </p>
                        )}
                    </div>

                    {result && (
                        <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                                <Globe className="h-3 w-3" /> Translation Result
                            </h4>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {result}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {result ? (
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleTranslate} disabled={isTranslating || isLoadingLanguages || languages.length === 0}>
                                {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Translate
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
