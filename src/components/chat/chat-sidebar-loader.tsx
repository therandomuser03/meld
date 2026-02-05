import { getUserThreads } from "@/actions/chat";
import { ThreadList } from "@/components/chat/thread-list";

export async function ChatSidebarLoader({ userId }: { userId: string }) {
    const threads = await getUserThreads(userId);

    return <ThreadList initialThreads={threads} currentUserId={userId} />;
}
