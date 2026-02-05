"use client";

import { Button } from "@/components/ui/button";
import { Plus, Folder, Star, User, Briefcase, Search, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { createNote } from "@/lib/actions/notes";
import { useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function NoteNav({ notes, sharedNotes = [], sharedWithOthersNotes = [] }: { notes: any[], sharedNotes?: any[], sharedWithOthersNotes?: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'my' | 'shared' | 'shared_out' | 'favorites'>('my');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const activeId = params.noteId;
  const query = searchParams.get('q')?.toLowerCase() || "";

  let currentNotes: any[] = [];
  if (view === 'my') currentNotes = notes;
  else if (view === 'shared') currentNotes = sharedNotes;
  else if (view === 'shared_out') currentNotes = sharedWithOthersNotes;
  else if (view === 'favorites') currentNotes = notes.filter(n => n.pinned);

  const filteredNotes = currentNotes.filter(note => {
    if (query.startsWith('#')) {
      const tagQuery = query.substring(1);
      return note.tags?.some((t: string) => t.toLowerCase().includes(tagQuery));
    }
    return note.title.toLowerCase().includes(query) ||
      note.body.toLowerCase().includes(query);
  });

  // Collect all unique tags from user notes
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))) as string[];

  const handleSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleCreateNote = async () => {
    try {
      setIsLoading(true);
      await createNote();
      setIsLoading(false); // Reset loading state on success
    } catch (error) {
      console.error("Failed to create note:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 w-80 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Search Header */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search notes or #tag..."
          className="dark:bg-slate-950 bg-slate-100 dark:border-white/10 border-black/5 pl-9 dark:text-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-blue-600 rounded-xl h-10"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
        />
      </div>

      <Button
        onClick={handleCreateNote}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-6 justify-start gap-2 shadow-lg shadow-blue-900/10"
      >
        <Plus className="h-4 w-4" />
        {isLoading ? "Creating..." : "New Note"}
      </Button>

      {/* Categories */}
      <div className="space-y-1 mb-6">
        <NavButton
          icon={Folder}
          label="My Notes"
          active={view === 'my'}
          onClick={() => setView('my')}
        />
        <NavButton
          icon={Users}
          label="Shared with Me"
          active={view === 'shared'}
          onClick={() => setView('shared')}
        />
        <NavButton
          icon={User}
          label="Shared by Me"
          active={view === 'shared_out'}
          onClick={() => setView('shared_out')}
        />
        <NavButton
          icon={Star}
          label="Favorites"
          active={view === 'favorites'}
          onClick={() => setView('favorites')}
        />
      </div>

      {/* Note List (merged) */}
      <div className="flex-1 min-h-0 border-t dark:border-white/10 border-black/5 pt-4 mb-4">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-1 pr-3">
            {filteredNotes.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-slate-500 text-sm">No notes found.</p>
              </div>
            )}
            {filteredNotes.map((note) => {
              const isActive = activeId === note.id;
              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className={cn(
                    "flex flex-col p-3 rounded-lg transition-colors text-left",
                    isActive ? "dark:bg-white/5 bg-white shadow-sm" : "dark:hover:bg-white/5 hover:bg-black/5"
                  )}
                >
                  <h4 className={cn("font-medium text-sm truncate w-full", isActive ? "text-blue-600" : "dark:text-white text-slate-900")}>
                    {note.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                    {/* If Shared WITH Me, show author (already done) */}
                    {view === 'shared' && note.author && (
                      <Avatar className="h-4 w-4 ml-2">
                        <AvatarImage src={note.author.avatarUrl} />
                        <AvatarFallback className="text-[8px] dark:bg-slate-800 bg-slate-300 dark:text-slate-300 text-slate-600">
                          {note.author.name?.substring(0, 2).toUpperCase() || "UH"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {/* If Shared BY Me, maybe show count or first sharee? */}
                    {view === 'shared_out' && note.sharedWith && note.sharedWith.length > 0 && (
                      <div className="flex -space-x-1 ml-2">
                        {note.sharedWith.slice(0, 3).map((u: any, i: number) => (
                          <Avatar key={i} className="h-4 w-4 border dark:border-slate-900 border-white">
                            <AvatarImage src={u.avatarUrl} />
                            <AvatarFallback className="text-[6px] dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600">{u.name?.[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {note.sharedWith.length > 3 && (
                          <span className="text-[8px] text-slate-500 pl-1 self-center">+{note.sharedWith.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Tags */}
      <div className="mt-auto px-2 pt-2 border-t dark:border-white/5 border-black/5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <TagBadge key={tag} label={tag} onClick={() => handleSearch('#' + tag)} />
          ))}
          {allTags.length === 0 && <span className="text-[10px] dark:text-slate-600 text-slate-400">No tags yet.</span>}
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-blue-600/10 dark:text-blue-400 text-blue-600 shadow-sm"
          : "dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/5 hover:bg-black/5"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function TagBadge({ label, onClick }: { label: string, onClick?: () => void }) {
  return (
    <span onClick={onClick} className="px-2 py-1 rounded dark:bg-slate-800 bg-slate-300 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-blue-600 cursor-pointer transition-colors text-[10px]">
      #{label}
    </span>
  )
}
