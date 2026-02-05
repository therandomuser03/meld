// app/(app)/chat/page.tsx
import { MessageSquare } from "lucide-react";

export default function ChatEmptyPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="bg-secondary p-6 rounded-full mb-6">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Select a conversation to start chatting</h2>
            <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the list on the left to get chatting.
            </p>
        </div>
    );
}

