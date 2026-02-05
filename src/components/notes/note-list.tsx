"use client";

// import { Search } from "lucide-react";
// import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NoteList({ notes }: { notes: any[] }) {
    const params = useParams();
    const searchParams = useSearchParams();
    const activeId = params.noteId;
    const query = searchParams.get('q')?.toLowerCase() || "";

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
    );

    return (
        <div className="flex flex-col h-full">
            {/* List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {filteredNotes.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notes found.
                        </div>
                    )}
                    {filteredNotes.map((note) => {
                        const isActive = activeId === note.id;
                        return (
                            <Link
                                key={note.id}
                                href={`/notes/${note.id}`}
                                className={cn(
                                    "p-4 border-b border-border transition-colors hover:bg-secondary/50",
                                    isActive ? "bg-primary/10 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                                )}
                            >
                                <h4 className={cn("font-semibold text-sm mb-1", isActive ? "text-primary" : "text-foreground")}>
                                    {note.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {note.body.replace(/[#*`]/g, '') /* Simple strip markdown */}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground opacity-60">
                                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}