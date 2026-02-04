// app/(app)/chat/page.tsx
import { MessageSquare } from "lucide-react";

export default function ChatEmptyPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950/50">
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">Select a conversation to start chatting</p>
        </div>
    );
}