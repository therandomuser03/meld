import { createClient } from "@/lib/supabase/server";
import {
  StatCard,
  RecentMessagesCard,
  PendingTasksCard,
  PinnedNotesCard,
} from "@/components/dashboard/overview-cards";
import { MessageSquare, Pin, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import prisma from "@/lib/prisma/client";
import { getUnreadCount, getUserThreads } from "@/actions/chat";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch User Data
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
  });

  // 2. Fetch Dashboard Metrics
  const unreadCount = await getUnreadCount(user.id);
  const pinnedNotesCount = await prisma.note.count({
    where: { authorId: user.id, pinned: true }
  });
  const pendingTasksCount = await prisma.task.count({
    where: { authorId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } }
  });

  // 3. Fetch Recent Data
  // Messages
  const rawThreads = await getUserThreads(user.id);
  const recentThreads = rawThreads.slice(0, 5).map(t => {
    let name = "Unknown";
    let initials = "??";
    let avatar = "";
    if (t.type === "DIRECT") {
      const other = t.userAId === user.id ? t.userB : t.userA;
      name = other?.name || "Unknown";
      avatar = other?.avatarUrl || "";
      initials = name.substring(0, 2).toUpperCase();
    } else {
      name = t.room?.name || "Group";
      initials = name.substring(0, 2).toUpperCase();
    }
    return {
      id: t.id,
      name,
      initials,
      avatar,
      time: t.updatedAt ? formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true }) : "",
      preview: t.messages?.[0]?.content || "No messages"
    }
  });


  // Pending Tasks
  const rawTasks = await prisma.task.findMany({
    where: { authorId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'desc' }, // or priority
    take: 10
  });
  const pendingTasks = rawTasks.map(t => ({
    title: t.title,
    project: "", // t.room?.name or similar if linked
    dueText: t.endDate ? format(new Date(t.endDate), "MMM d") : null,
    urgent: t.priority === 'HIGH',
    done: false
  }));

  // Pinned Notes
  const rawNotes = await prisma.note.findMany({
    where: { authorId: user.id, pinned: true },
    orderBy: { updatedAt: 'desc' },
    take: 4
  });
  const pinnedNotes = rawNotes.map(n => ({
    title: n.title,
    excerpt: n.body?.substring(0, 60) + (n.body?.length > 60 ? "..." : ""),
    type: "text", // logic for type if needed
    updatedAt: formatDistanceToNow(new Date(n.updatedAt), { addSuffix: true })
  }));

  const today = format(new Date(), "MMMM do");

  const name = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || "User";
  const firstName = name.split(' ')[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <DashboardHeader firstName={firstName} date={today} />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          labelId="dashboard.stats.unread"
          count={unreadCount}
          badgeText={unreadCount > 0 ? "New messages" : undefined}
          badgeColor="blue"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatCard
          labelId="dashboard.stats.pinned"
          count={pinnedNotesCount}
          icon={<Pin className="h-5 w-5" />}
        />
        <StatCard
          labelId="dashboard.stats.pending"
          count={pendingTasksCount}
          badgeText={pendingTasksCount > 0 ? "Action required" : undefined}
          badgeColor="orange"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">

        {/* Left Column */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <RecentMessagesCard threads={recentThreads} />
          </div>
          <div className="h-[200px] shrink-0">
            <PinnedNotesCard notes={pinnedNotes} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <PendingTasksCard tasks={pendingTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}