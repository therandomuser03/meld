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
  // 1. Tasks created by "current user" (My Tasks)
  const myTasksRaw = await prisma.task.findMany({
    where: {
      authorId: user.id
      // status: { not: 'DONE' } // Optional filter
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignees: { include: { user: true } }
    }
  });

  // 2. Tasks shared with "current user" (Shared Tasks)
  // where assignee.userId = user.id AND authorId != user.id
  const sharedTasksRaw = await prisma.task.findMany({
    where: {
      assignees: {
        some: { userId: user.id }
      },
      NOT: {
        authorId: user.id
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assignees: { include: { user: true } },
      author: { select: { name: true, avatarUrl: true } } // Show who shared it
    }
  });

  const transformTask = (t: any) => ({
    ...t,
    startDate: t.startDate?.toISOString() || null,
    endDate: t.endDate?.toISOString() || null,
    dueDate: t.endDate?.toISOString() || null,
    isAllDay: t.isAllDay,
    priority: (t.priority as "HIGH" | "MEDIUM" | "LOW") || "MEDIUM"
  });

  const myTasks = myTasksRaw.map(transformTask);
  const sharedTasks = sharedTasksRaw.map(transformTask);

  return (
    <div className="h-full flex flex-col space-y-4 p-6">
      <NavigationBreadcrumb pageName="Tasks" />
      <div className="flex-1 min-h-0">
        <TaskBoard myTasks={myTasks} sharedTasks={sharedTasks} currentUser={user} />
      </div>
    </div>
  );
}