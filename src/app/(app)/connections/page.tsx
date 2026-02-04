import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
import { InvitationCard } from "@/components/connections/invitation-card";
import { UserGrid } from "@/components/connections/user-grid";
import { NotificationDropdown } from "@/components/connections/notification-dropdown";
import { getMutualCounts } from "@/lib/actions/connections";

export default async function ConnectionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // 1. Fetch Incoming Requests
    const incomingRequestsRaw = await prisma.connectionRequest.findMany({
        where: { toUserId: user.id, status: "PENDING" },
        include: {
            fromUser: {
                select: { id: true, name: true, profession: true, avatarUrl: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const incomingRequests = await Promise.all(incomingRequestsRaw.map(async (req) => {
        const [userWithMutual] = await getMutualCounts(user.id, [req.fromUser]);
        return { ...req, fromUser: userWithMutual };
    }));

    // 2. Fetch Sent Requests
    const sentRequestsRaw = await prisma.connectionRequest.findMany({
        where: { fromUserId: user.id, status: "PENDING" },
        include: {
            toUser: {
                select: { id: true, name: true, profession: true, avatarUrl: true, bio: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const sentRequests = await Promise.all(sentRequestsRaw.map(async (req) => {
        const [userWithMutual] = await getMutualCounts(user.id, [req.toUser]);
        return { ...req, toUser: userWithMutual };
    }));

    // 3. Fetch Established Connections
    const connections = await prisma.connection.findMany({
        where: {
            OR: [{ userAId: user.id }, { userBId: user.id }]
        },
        include: {
            userA: { select: { id: true, name: true, profession: true, avatarUrl: true, bio: true } },
            userB: { select: { id: true, name: true, profession: true, avatarUrl: true, bio: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const connectedUsersRaw = connections.map(c => c.userAId === user.id ? c.userB : c.userA);
    const connectedUsers = await getMutualCounts(user.id, connectedUsersRaw);

    // 4. Fetch Suggestions
    const excludedUserIds = [
        user.id,
        ...connectedUsers.map(u => u.id),
        ...sentRequests.map(r => r.toUserId),
        ...incomingRequests.map(r => r.fromUserId)
    ];

    const suggestionsRaw = await prisma.userProfile.findMany({
        where: { id: { notIn: excludedUserIds } },
        take: 8,
        select: { id: true, name: true, profession: true, bio: true, avatarUrl: true }
    });

    const suggestions = await getMutualCounts(user.id, suggestionsRaw);

    // 5. Fetch Notifications
    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const unreadCount = await prisma.notification.count({
        where: { userId: user.id, readAt: null }
    });

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white text-slate-900">Find People</h1>
                    <p className="dark:text-slate-400 text-slate-600">Expand your network and connect with professionals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <NotificationDropdown
                        notifications={notifications}
                        unreadCount={unreadCount + incomingRequests.length}
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10">
                        Invite Friends
                    </Button>
                </div>
            </div>

            {/* Invitations Section (Incoming) */}
            {incomingRequests.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-semibold dark:text-white text-slate-900">
                            Invitations <span className="text-blue-500">({incomingRequests.length})</span>
                        </h2>
                        <Button variant="link" className="text-blue-400 h-auto p-0 text-sm">Manage all</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {incomingRequests.map(req => (
                            <InvitationCard key={req.id} request={req} />
                        ))}
                    </div>
                </section>
            )}

            {/* Dynamic User Grid Search */}
            <UserGrid
                currentUserId={user.id}
                initialSuggestions={suggestions}
                initialPending={sentRequests.map(r => ({ ...r.toUser, status: "PENDING" as const }))}
                initialAccepted={connectedUsers.map(u => ({ ...u, status: "CONNECTED" as const }))}
            />
        </div>
    );
}

