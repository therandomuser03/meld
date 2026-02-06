"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon,
    Image as ImageIcon, Share2, Save, Globe, Loader2, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";


import { updateNote } from "@/lib/actions/notes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareNoteDialog } from "./share-note-dialog";
import { cn } from "@/lib/utils";

interface EditorProps {
    note: {
        id: string;
        title: string;
        body: string;
        visibility: "PRIVATE" | "ROOM" | "SHARED";
        sharedWith: { id: string }[];
        authorId: string;
        pinned: boolean;
        tags: string[];
    };
    userLanguages: { code: string; name: string }[];
    availableLanguages: { code: string; name: string }[];
    currentUserId: string;
}

export function Editor({ note, userLanguages, availableLanguages, currentUserId }: EditorProps) {
    const router = useRouter();
    const [title, setTitle] = React.useState(note.title);
    const titleRef = React.useRef(note.title); // Ref to access latest title in Tiptap callbacks
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("saved");
    const [isTranslating, setIsTranslating] = React.useState(false);
    const [targetLang, setTargetLang] = React.useState<{ code: string, name: string } | null>(null);
    const [isPinned, setIsPinned] = React.useState(note.pinned);
    const [tags, setTags] = React.useState<string[]>(note.tags || []);

    const isReadOnly = note.authorId !== currentUserId;

    const updateTags = async (newTags: string[]) => {
        setTags(newTags);
        try {
            await updateNote(note.id, { tags: newTags });
        } catch (e) {
            toast.error("Failed to update tags");
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value.trim();
            if (val && !tags.includes(val)) {
                updateTags([...tags, val]);
                e.currentTarget.value = "";
            }
        }
    }

    const handleRemoveTag = (tag: string) => {
        updateTags(tags.filter(t => t !== tag));
    }

    const handleTogglePin = async () => {
        const newState = !isPinned;
        setIsPinned(newState);
        try {
            await updateNote(note.id, { pinned: newState });
            toast.success(newState ? "Note added to favorites" : "Note removed from favorites");
        } catch (e) {
            setIsPinned(!newState);
            toast.error("Failed to update status");
        }
    }

    // Debounced save function
    const debouncedSave = React.useCallback(
        debounce(async (id: string, newTitle: string, newBody: string) => {
            if (isReadOnly) return;
            try {
                await updateNote(id, { title: newTitle, body: newBody });
                setSaveStatus("saved");
            } catch (e) {
                setSaveStatus("idle"); // or error state
                toast.error("Failed to save");
            }
        }, 2000), // 2 second debounce as requested ("show 'Saving...' for 2 secs after finishing typing") - interpretation: wait 2s then save
        []
    );

    // Handle Title Change
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isReadOnly) return;
        const newTitle = e.target.value;
        setTitle(newTitle);
        titleRef.current = newTitle;
        setSaveStatus("saving");
        if (editor) {
            debouncedSave(note.id, newTitle, (editor.storage as any).markdown.getMarkdown());
        }
    };

    // Initialize Tiptap
    const editor = useEditor({
        editable: !isReadOnly,
        extensions: [
            StarterKit,
            Markdown, // Allows us to get/set Markdown
        ],
        content: note.body, // Initial markdown content
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-foreground",
            },
        },
        onUpdate: ({ editor }) => {
            if (isReadOnly) return;
            setSaveStatus("saving");
            debouncedSave(note.id, titleRef.current, (editor.storage as any).markdown.getMarkdown());
        },
        immediatelyRender: false,
    });

    // Handle Translation (Lingo.dev integration point)
    const handleTranslate = async (targetLocale: string = 'es') => {
        if (!editor) return;
        setIsTranslating(true);
        const originalMarkdown = (editor.storage as any).markdown.getMarkdown();

        try {
            // Call your internal API which calls Lingo.dev
            const res = await fetch("/api/translate", {
                method: "POST",
                body: JSON.stringify({
                    content: originalMarkdown,
                    targetLocale,
                    format: "markdown" // Important for Lingo to preserve formatting
                })
            });

            const data = await res.json();

            if (data.translatedContent) {
                // If read-only, we just show the translated content in the editor view, but we DON'T save it to the DB as an update to the note body.
                // However, Lingo.dev SDK (in action) usually returns the translation.
                // If the user is a viewer, they might want to see the translation transiently.
                // Tiptap's setContent works even if editable is false? Yes, programmatically it should work.
                editor.commands.setContent(data.translatedContent);
                toast.success("Content translated!");

                if (!isReadOnly) {
                    // Trigger save after translation ONLY if owner
                    setSaveStatus("saving");
                    debouncedSave(note.id, title, data.translatedContent);
                } else {
                    toast.info("Viewing translation (Read-only)");
                }
            }
        } catch (e) {
            toast.error("Translation failed");
        } finally {
            setIsTranslating(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            {/* Toolbar */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-md">
                {/* Formatting Tools */}
                <div className="flex items-center gap-1">
                    {!isReadOnly && (
                        <>
                            <ToolbarBtn
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                active={editor.isActive('bold')}
                                icon={Bold}
                            />
                            <ToolbarBtn
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                active={editor.isActive('italic')}
                                icon={Italic}
                            />
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            <ToolbarBtn
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                active={editor.isActive('bulletList')}
                                icon={List}
                            />
                            <ToolbarBtn
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                active={editor.isActive('orderedList')}
                                icon={ListOrdered}
                            />
                        </>
                    )}
                    {isReadOnly && (
                        <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                            <span>Read Only</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {!isReadOnly && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mr-2 transition-colors duration-300">
                            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${saveStatus === 'saving' ? "bg-yellow-500" :
                                saveStatus === 'saved' ? "bg-emerald-500" : "bg-muted-foreground"
                                }`} />
                            {saveStatus === 'saving' ? "Saving..." :
                                saveStatus === 'saved' ? "Saved just now" : ""}
                        </div>
                    )}

                    {/* Translate Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isTranslating}
                                className="border-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-2"
                            >
                                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                                {targetLang ? targetLang.name : "Translate"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground max-h-[300px] overflow-y-auto">
                            {userLanguages.length > 0 && (
                                <>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">My Languages</div>
                                    {userLanguages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => {
                                                setTargetLang(lang);
                                                handleTranslate(lang.code);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {lang.name}
                                        </DropdownMenuItem>
                                    ))}
                                    <div className="h-px bg-border my-1" />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">All Languages</div>
                                </>
                            )}

                            {availableLanguages.filter(l => !userLanguages.some(ul => ul.code === l.code)).map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => {
                                        setTargetLang(lang);
                                        handleTranslate(lang.code);
                                    }}
                                    className="hover:bg-white/10 cursor-pointer focus:bg-white/10 focus:text-white"
                                >
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}

                            {availableLanguages.length === 0 && userLanguages.length === 0 && (
                                <DropdownMenuItem disabled className="text-slate-500">
                                    No languages available
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Favorite Button */}
                    {!isReadOnly && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                                "text-muted-foreground hover:text-yellow-400 gap-2",
                                isPinned && "text-yellow-400 hover:text-yellow-500"
                            )}
                            onClick={handleTogglePin}
                        >
                            <Star className={cn("h-4 w-4", isPinned && "fill-current")} />
                        </Button>
                    )}

                    {/* Share Dialog */}
                    {note.authorId === currentUserId && (
                        <ShareNoteDialog
                            noteId={note.id}
                            initialVisibility={note.visibility}
                            initialSharedWith={note.sharedWith.map(u => u.id)}
                            currentUser={{ id: currentUserId }}
                        />
                    )}
                </div>
            </div >

            {/* Editor Surface */}
            < div className="flex-1 overflow-y-auto p-8 md:p-12" >
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Title Input */}
                    <input
                        value={title}
                        onChange={handleTitleChange}
                        disabled={isReadOnly}
                        className={cn(
                            "w-full bg-transparent text-4xl font-bold text-foreground placeholder:text-muted-foreground outline-none border-none",
                            isReadOnly && "opacity-80"
                        )}
                        placeholder="Note Title"
                    />

                    {/* Tags Input */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                                #{tag}
                                {!isReadOnly && (
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-foreground"
                                    >
                                        &times;
                                    </button>
                                )}
                            </span>
                        ))}
                        {!isReadOnly && (
                            <input
                                className="bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none min-w-[100px]"
                                placeholder="Add tag + Enter..."
                                onKeyDown={handleAddTag}
                            />
                        )}
                    </div>

                    {/* Tiptap Area */}
                    <EditorContent editor={editor} />
                </div>
            </div >
        </div >
    );
}

function ToolbarBtn({ onClick, active, icon: Icon }: { onClick: () => void, active: boolean, icon: any }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
        >
            <Icon className="h-4 w-4" />
        </button>
    )
}