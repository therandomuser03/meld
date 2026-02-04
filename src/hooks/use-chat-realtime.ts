"use client";

import * as React from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { createClient } from "@/lib/supabase/client";

export function useChatRealtime(threadId: string) {
    const addMessage = useChatStore((state) => state.addMessage);
    const supabase = createClient();

    React.useEffect(() => {
        if (!threadId) return;

        // Listen for new messages in this thread
        const channel = supabase
            .channel(`chat_messages:${threadId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                    filter: `threadId=eq.${threadId}`,
                },
                async (payload) => {
                    // Fetch the full message with relations once notified
                    const { data: fullMessage } = await supabase
                        .from('Message')
                        .select(`
                            *,
                            author:UserProfile(id, name, avatarUrl),
                            translations:Translation(*)
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (fullMessage) {
                        addMessage(threadId, fullMessage as any);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [threadId, addMessage, supabase]);
}

export function useThreadsRealtime(userId: string) {
    const { threads, setThreads, updateThreadState } = useChatStore();
    const supabase = createClient();

    React.useEffect(() => {
        if (!userId) return;

        // Listen for ANY message changes to update sidebar previews
        const channel = supabase
            .channel(`user_threads:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Message',
                },
                async (payload) => {
                    const threadId = payload.new.threadId;

                    // Check if this thread is in our list
                    const belongsToUser = threads.some(t => t.id === threadId);

                    if (belongsToUser) {
                        updateThreadState(threadId, payload.new.content, payload.new.createdAt);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, threads, updateThreadState, supabase]);
}
