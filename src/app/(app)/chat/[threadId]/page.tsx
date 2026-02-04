import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getThreadMessages, getThreadDetails } from "@/actions/chat";
import { ChatWindow } from "@/components/chat/chat-window";
import prisma from "@/lib/prisma/client";

interface PageProps {
    params: Promise<{
        threadId: string;
    }>;
}

export default async function ChatThreadPage({ params }: PageProps) {
    const { threadId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const [messages, thread, userProfile] = await Promise.all([
        getThreadMessages(threadId),
        getThreadDetails(threadId),
        prisma.userProfile.findUnique({
            where: { id: user.id },
            include: {
                languages: {
                    include: { language: true }
                }
            }
        })
    ]);

    if (!thread) return <div>Thread not found</div>;

    const userLanguages = userProfile?.languages.map(l => ({
        code: l.language.locale,
        name: l.language.nameEnglish
    })) || [];

    // Determine the other user's name
    let otherUserName = "Chat";
    let otherUserAvatar = "";

    if (thread.type === "DIRECT") {
        const otherUser = thread.userAId === user.id ? thread.userB : thread.userA;
        otherUserName = otherUser?.name || "User";
        otherUserAvatar = otherUser?.avatarUrl || "";
    } else if (thread.room) {
        otherUserName = thread.room.name;
    }

    return (
        <ChatWindow
            threadId={threadId}
            initialMessages={messages}
            currentUserId={user.id}
            otherUser={{ name: otherUserName, avatar: otherUserAvatar }}
            userLanguages={userLanguages}
            isGroup={thread.type === "ROOM"}
        />
    );
}