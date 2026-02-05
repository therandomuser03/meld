import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { TaskBoard } from "@/components/tasks/task-board";
import { NavigationBreadcrumb } from "@/components/common/navigation-breadcrumb";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch tasks
  // Note: We are mocking 'priority' extraction since it's not in your schema yet.
  // Ideally, you should add `priority String?` to your Prisma schema.
  const rawTasks = await prisma.task.findMany({
    where: {
      authorId: user.id,
      // Optional: Filter out old completed tasks to keep board clean?
      // status: { not: 'DONE' } // or show all
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignees: { include: { user: true } }
    }
  });

  // Transform for UI (Handle priority if stored in description or separate field)
  const tasks = rawTasks.map((t) => ({
    ...t,
    startDate: t.startDate?.toISOString() || null,
    endDate: t.endDate?.toISOString() || null,
    dueDate: t.endDate?.toISOString() || null,
    isAllDay: t.isAllDay,
    priority: (t.priority as "HIGH" | "MEDIUM" | "LOW") || "MEDIUM"
  }));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <NavigationBreadcrumb pageName="Tasks" />
      <div className="flex-1 min-h-0">
        <TaskBoard tasks={tasks} />
      </div>
    </div>
  );
}