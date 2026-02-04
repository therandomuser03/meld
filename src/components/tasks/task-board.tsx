"use client";

import * as React from "react";
import { MoreHorizontal, Calendar, CheckCircle2, Trash2, ArrowRight, Loader2, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CreateTaskDialog } from "./create-task-dialog";

// Types
type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
  priority?: "HIGH" | "MEDIUM" | "LOW"; // logical field
  startDate?: string | null;
  endDate?: string | null;
  isAllDay: boolean;
  assignees?: { user: { avatarUrl: string | null } }[];
};

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks: initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = React.useState(initialTasks);
  const router = useRouter();
  const supabase = createClient();

  // Sync state when props change (e.g., after router.refresh())
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Optimistic Updates
  const updateStatus = async (taskId: string, newStatus: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

    try {
      // Assuming you have a server action or API route for this
      // await updateTaskStatus(taskId, newStatus);
      // For demo, using direct supabase call if RLS allows, or fetch API
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error();

      router.refresh();
    } catch (err) {
      setTasks(previousTasks);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success("Task deleted forever");
      router.refresh();
    } catch (err) {
      setTasks(previousTasks);
      toast.error("Failed to delete task");
    }
  };

  const columns = [
    { id: "TODO", label: "To Do", color: "bg-secondary" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-primary" },
    { id: "DONE", label: "Completed", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Tasks</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-border text-secondary hover:text-text hover:bg-secondary/50">
            <a href="/tasks/history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              View History
            </a>
          </Button>
          <CreateTaskDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="flex flex-col h-full min-h-[500px] rounded-2xl bg-secondary/10 border border-border overflow-hidden">
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-border bg-secondary/20">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold uppercase tracking-wider text-muted-foreground")}>
                    {col.label}
                  </span>
                  <Badge variant="secondary" className="bg-background text-secondary hover:bg-background shadow-sm">
                    {colTasks.length}
                  </Badge>
                </div>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Task List */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateStatus}
                      onDelete={deleteTask}
                    />
                  ))}

                  {/* Empty State for ToDo */}
                  {col.id === 'TODO' && (
                    <CreateTaskDialog trigger={
                      <button className="w-full py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition-all text-sm font-medium flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Add Task
                      </button>
                    } />
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete
}: {
  task: Task;
  onStatusChange: (id: string, s: string) => void;
  onDelete: (id: string) => void;
}) {
  const priorityColor = {
    HIGH: "dark:text-red-400 text-red-700 dark:bg-red-500/10 bg-red-500/15 dark:border-red-500/20 border-red-500/30",
    MEDIUM: "dark:text-orange-400 text-orange-800 dark:bg-orange-500/10 bg-orange-500/15 dark:border-orange-500/20 border-orange-500/30",
    LOW: "dark:text-emerald-400 text-emerald-700 dark:bg-emerald-500/10 bg-emerald-500/15 dark:border-emerald-500/20 border-emerald-500/30",
  }[task.priority || "MEDIUM"]; // Default to MEDIUM if undefined

  const formatDate = () => {
    if (!task.endDate) return 'No date';
    const start = task.startDate ? new Date(task.startDate) : null;
    const end = new Date(task.endDate);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short', day: 'numeric',
      hour: task.isAllDay ? undefined : 'numeric',
      minute: task.isAllDay ? undefined : 'numeric'
    };

    if (!start) return end.toLocaleDateString(undefined, options);

    return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
  }

  return (
    <div className="group relative bg-card hover:bg-secondary/50 border border-border hover:border-border/80 rounded-xl p-4 transition-all shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold border", priorityColor)}>
          {task.priority || "Medium"}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
            <DropdownMenuItem
              disabled={task.status === 'TODO'}
              onClick={() => onStatusChange(task.id, 'TODO')}
            >
              Move to To Do
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={task.status === 'IN_PROGRESS'}
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
            >
              Move to In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={task.status === 'DONE'}
              onClick={() => onStatusChange(task.id, 'DONE')}
            >
              Mark as Done
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 focus:text-red-300 dark:focus:bg-red-900/20 focus:bg-red-50"
              onClick={() => onDelete(task.id)}
            >
              Delete Forever
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-sm font-semibold text-text mb-3 line-clamp-2">
        {task.title}
      </h3>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          {task.status === 'DONE' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Calendar className="h-3.5 w-3.5" />
          )}
          <span>{formatDate()}</span>
        </div>

        {/* Mock Avatar - In real app use task.assignees */}
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-medium border border-background">
          ME
        </div>
      </div>

      {/* Progress Bar visual for "In Progress" */}
      {task.status === 'IN_PROGRESS' && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-2/3 rounded-bl-xl" />
      )}
    </div>
  );
}