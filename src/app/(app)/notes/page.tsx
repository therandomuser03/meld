"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { createNote } from "@/lib/actions/notes";
import { useState } from "react";

export default function NotesPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateNote = async () => {
        try {
            setIsLoading(true);
            await createNote();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                <FileText className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Select a note to view</h2>
            <p className="text-slate-400 max-w-sm mb-8">
                Choose a note from the list on the left, or create a new one to get started.
            </p>
            <Button
                onClick={handleCreateNote}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
                <Plus className="h-5 w-5" />
                {isLoading ? "Creating..." : "Create New Note"}
            </Button>
        </div>
    );
}
