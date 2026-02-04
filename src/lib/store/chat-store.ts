import { create } from 'zustand';

interface Message {
    id: string;
    content: string;
    authorId: string;
    threadId: string;
    createdAt: string;
    author?: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
    };
    translations?: any[];
    sourceLocale?: string;
}

interface Thread {
    id: string;
    type: string;
    userAId?: string;
    userBId?: string;
    userA?: any;
    userB?: any;
    room?: any;
    messages: any[];
    updatedAt: string;
}

interface ChatState {
    messages: Record<string, Message[]>; // threadId -> messages
    threads: Thread[];
    isFetching: Record<string, boolean>;

    // Actions
    setMessages: (threadId: string, messages: Message[]) => void;
    addMessage: (threadId: string, message: Message) => void;
    setFetching: (threadId: string, isFetching: boolean) => void;
    setThreads: (threads: Thread[]) => void;
    updateThreadState: (threadId: string, lastMessage: string, updatedAt: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: {},
    threads: [],
    isFetching: {},

    setMessages: (threadId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [threadId]: messages }
        })),

    addMessage: (threadId, message) =>
        set((state) => {
            const currentMessages = state.messages[threadId] || [];
            if (currentMessages.some((m) => m.id === message.id)) return state;

            const updatedMsgs = [...currentMessages, message].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Also update the thread list order
            const updatedThreads = state.threads.map(t => {
                if (t.id === threadId) {
                    return {
                        ...t,
                        messages: [message], // Just keep the last one for the preview
                        updatedAt: message.createdAt
                    };
                }
                return t;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            return {
                messages: {
                    ...state.messages,
                    [threadId]: updatedMsgs,
                },
                threads: updatedThreads
            };
        }),

    setFetching: (threadId, isFetching) =>
        set((state) => ({
            isFetching: { ...state.isFetching, [threadId]: isFetching }
        })),

    setThreads: (threads) => set({ threads }),

    updateThreadState: (threadId, lastMessage, updatedAt) =>
        set((state) => {
            const updatedThreads = state.threads.map(t => {
                if (t.id === threadId) {
                    return {
                        ...t,
                        updatedAt,
                        messages: [{ content: lastMessage }]
                    };
                }
                return t;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            return { threads: updatedThreads };
        }),
}));
