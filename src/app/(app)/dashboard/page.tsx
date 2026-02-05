import { createClient } from "@/lib/supabase/server";
import {
  StatCard,
  PinnedNotesCard,
  PendingTasksList
} from "@/components/dashboard/overview-cards";
import { MessageSquare, Pin, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import prisma from "@/lib/prisma/client";
import { getUnreadCount } from "@/actions/chat";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NavigationBreadcrumb } from "@/components/common/navigation-breadcrumb";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch User Data
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
  });

  const today = format(new Date(), "do MMMM"); // e.g. 5th February
  const name = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || "User";
  const firstName = name.split(' ')[0];

  // 1. Fetch Dashboard Metrics
  const unreadCount = await getUnreadCount(user.id);
  const pendingNotesCount = await prisma.note.count({
    where: { authorId: user.id }
  });
  const pendingTasksCount = await prisma.task.count({
    where: { authorId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } }
  });

  // 2. Fetch Content Data
  // Pinned Notes (Latest 5)
  const rawNotes = await prisma.note.findMany({
    where: { authorId: user.id, pinned: true },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });
  const pinnedNotes = rawNotes.map(n => ({
    id: n.id,
    title: n.title,
    excerpt: n.body?.substring(0, 60).replace(/[#*_]/g, '') + (n.body?.length > 60 ? "..." : ""), // Clean md chars
    updatedAt: formatDistanceToNow(new Date(n.updatedAt), { addSuffix: true })
  }));

  // Pending Tasks (Latest 5)
  const rawTasks = await prisma.task.findMany({
    where: { authorId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } },
    orderBy: { createdAt: 'desc' }, // or priority
    take: 5
  });
  const pendingTasks = rawTasks.map(t => ({
    title: t.title,
    project: "", // t.room?.name or similar if linked
    dueText: t.endDate ? format(new Date(t.endDate), "MMM d") : null,
    urgent: t.priority === 'HIGH',
    done: false
  }));

  return (
    <div className="relative">
      {/* Fixed Background Tint Layer */}
      <div className="absolute inset-x-0 top-0 h-[600px] pointer-events-none -z-10 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      </div>

      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <NavigationBreadcrumb pageName="Dashboard" />

        {/* Header - Preserved Greeting */}
        <DashboardHeader firstName={firstName} date={today} />

        {/* Row 1: Metrics (3 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            labelId="dashboard.stats.unread"
            count={unreadCount}
            badgeText={unreadCount > 0 ? "New messages" : undefined}
            badgeColor="blue"
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <StatCard
            labelId="dashboard.stats.pending"
            count={pendingTasksCount}
            badgeText={pendingTasksCount > 0 ? "Action required" : undefined}
            badgeColor="orange"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            labelId="dashboard.stats.notes"
            count={pendingNotesCount}
            icon={<Pin className="h-5 w-5" />}
          />
        </div>

        {/* Row 2: Content Cards (2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          <PinnedNotesCard notes={pinnedNotes} />
          <PendingTasksList tasks={pendingTasks} />
        </div>
      </div>
    </div>
  );
}
