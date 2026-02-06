"use client";

import * as React from "react";
import { MoreHorizontal, Calendar, CheckCircle2, List, Trash2, ArrowRight, Loader2, Plus, Clock, Share2, Languages, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CreateTaskDialog } from "./create-task-dialog";
import { ShareTaskDialog } from "./share-task-dialog";
import { TranslateTaskDialog } from "./translate-task-dialog";

// Types
export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
  priority?: "HIGH" | "MEDIUM" | "LOW"; // logical field
  startDate?: string | null;
  endDate?: string | null;
  isAllDay: boolean;
  authorId: string;
  assignees?: { user: { id: string; avatarUrl: string | null; name: string | null } }[];
  author?: { name: string | null; avatarUrl: string | null };
};

interface TaskBoardProps {
  myTasks: Task[];
  sharedTasks: Task[];
  currentUser: any;
}

export function TaskBoard({ myTasks: initialMyTasks, sharedTasks: initialSharedTasks, currentUser }: TaskBoardProps) {
  const [myTasks, setMyTasks] = React.useState(initialMyTasks);
  const [sharedTasks, setSharedTasks] = React.useState(initialSharedTasks);
  const router = useRouter();

  // Sync state
  React.useEffect(() => {
    setMyTasks(initialMyTasks);
    setSharedTasks(initialSharedTasks);
  }, [initialMyTasks, initialSharedTasks]);

  // Optimistic Updates
  const updateStatus = async (taskId: string, newStatus: string, isShared: boolean) => {
    const targetSet = isShared ? setSharedTasks : setMyTasks;
    const currentTasks = isShared ? sharedTasks : myTasks;
    
    // Optimistic update
    targetSet(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch (err) {
      // Revert
      targetSet(currentTasks);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = [...myTasks];
    setMyTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success("Task deleted forever");
      router.refresh();
    } catch (err) {
      setMyTasks(previousTasks);
      toast.error("Failed to delete task");
    }
  };

  const columns = [
    { id: "TODO", label: "To Do", color: "bg-secondary" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-primary" },
    { id: "DONE", label: "Completed", color: "bg-emerald-500" },
  ];

  const renderBoard = (tasks: Task[], isShared: boolean) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="flex flex-col h-full min-h-[500px] rounded-2xl bg-secondary border border-border/50 overflow-hidden">
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-border/50 bg-secondary/50">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider text-muted-foreground")}>
                    {col.label}
                  </span>
                  <Badge variant="secondary" className="bg-background text-foreground hover:bg-background shadow-sm h-5 px-1.5">
                    {colTasks.length}
                  </Badge>
                </div>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground/50" />
              </div>

              {/* Task List */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      isSharedView={isShared}
                      onStatusChange={(id, s) => updateStatus(id, s, isShared)}
                      onDelete={deleteTask}
                    />
                  ))}

                  {/* Empty State for ToDo (only for My Tasks) */}
                  {!isShared && col.id === 'TODO' && (
                    <CreateTaskDialog trigger={
                      <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-border text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition-all text-sm font-medium flex items-center justify-center gap-2">
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
  );

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="my-tasks" className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <TabsList className="bg-secondary/50">
               <TabsTrigger value="my-tasks" className="gap-2">
                  <List className="h-4 w-4" /> My Tasks
               </TabsTrigger>
               <TabsTrigger value="shared-tasks" className="gap-2">
                  <UserIcon className="h-4 w-4" /> Shared With Me
               </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <a href="/tasks/history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History
              </a>
            </Button>
            <CreateTaskDialog />
          </div>
        </div>

        <TabsContent value="my-tasks" className="flex-1 min-h-0 mt-0">
           {renderBoard(myTasks, false)}
        </TabsContent>
        
        <TabsContent value="shared-tasks" className="flex-1 min-h-0 mt-0">
            {sharedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground border border-dashed border-border rounded-xl">
                    <Share2 className="h-10 w-10 mb-4 opacity-50" />
                    <p>No tasks have been shared with you yet.</p>
                </div>
            ) : (
                renderBoard(sharedTasks, true)
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({
  task,
  currentUser,
  isSharedView,
  onStatusChange,
  onDelete
}: {
  task: Task;
  currentUser: any;
  isSharedView: boolean;
  onStatusChange: (id: string, s: string) => void;
  onDelete: (id: string) => void;
}) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [translateOpen, setTranslateOpen] = React.useState(false);

  const priorityColor = {
    HIGH: "text-destructive bg-destructive/10 border-destructive/20",
    MEDIUM: "text-accent bg-accent/10 border-accent/20",
    LOW: "text-primary bg-primary/10 border-primary/20",
  }[task.priority || "MEDIUM"]; 

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

  const isAuthor = task.authorId === currentUser.id;

  return (
    <>
    <div className="group relative bg-muted/20 hover:bg-secondary border border-border/50 hover:border-primary/20 rounded-xl p-4 transition-all shadow-sm">
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
            <DropdownMenuItem onClick={() => setTranslateOpen(true)}>
                <Languages className="mr-2 h-4 w-4" /> Translate
            </DropdownMenuItem>
            
            {/* Show Share only if author */}
            {isAuthor && (
                <DropdownMenuItem onClick={() => setShareOpen(true)}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

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
            
            {isAuthor && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                className="text-red-400 focus:text-red-300 dark:focus:bg-red-900/20 focus:bg-red-50"
                onClick={() => onDelete(task.id)}
                >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
                </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-2">
        {task.title}
      </h3>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
          {task.status === 'DONE' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Calendar className="h-3.5 w-3.5" />
          )}
          <span>{formatDate()}</span>
        </div>

        {/* Assignee Avatar */}
        <div className="flex -space-x-2">
            {/* If shared view, show Author avatar */}
            {isSharedView && task.author ? (
                 <Avatar className="h-6 w-6 border-2 border-background" title={`Shared by ${task.author.name}`}>
                    <AvatarImage src={task.author.avatarUrl || ""} />
                    <AvatarFallback className="text-[9px] bg-indigo-500 text-white">
                        {task.author.name?.substring(0,2)?.toUpperCase()}
                    </AvatarFallback>
                 </Avatar>
            ) : (
                // My Tasks view: Show assignees
                (task.assignees && task.assignees.length > 0) ? (
                task.assignees.map((assignee, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-background" title={assignee.user.name || "User"}>
                    <AvatarImage src={assignee.user.avatarUrl || ""} />
                    <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                        {assignee.user.name?.substring(0,2)?.toUpperCase() || "??"}
                    </AvatarFallback>
                    </Avatar>
                ))
                ) : (
                    // Logic: If I created it and no assignees, it's mine.
                    null
                )
            )}
        </div>
      </div>

      {/* Progress Bar visual for "In Progress" */}
      {task.status === 'IN_PROGRESS' && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-2/3 rounded-bl-xl" />
      )}
    </div>

    {isAuthor && <ShareTaskDialog open={shareOpen} setOpen={setShareOpen} task={task} />}
    <TranslateTaskDialog open={translateOpen} setOpen={setTranslateOpen} task={task} />
    </>
  );
}