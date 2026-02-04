"use client";

import {
  MessageSquare,
  Pin,
  CheckCircle2,
  MoreHorizontal,
  Clock,
  Plus,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// 1. Top Stat Card
export function StatCard({
  labelId,
  count,
  badgeText,
  badgeColor,
  icon
}: {
  labelId: string;
  count: number;
  badgeText?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-white/10 bg-blue-700/50 dark:bg-slate-900/50 p-6 flex flex-col justify-between h-[140px]">
      <div className="flex justify-between items-start">
        <div className={cn("p-2 rounded-lg bg-slate-800", badgeColor ? "text-white" : "text-blue-400")}>
          {icon}
        </div>
        {badgeText && (
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border",
            badgeColor === "red" ? "bg-red-500/15 border-red-500/50 dark:text-red-400 text-red-700" :
              badgeColor === "orange" ? "bg-orange-500/15 border-orange-500/50 dark:text-orange-400 text-orange-800" :
                "bg-blue-500/15 border-blue-500/50 dark:text-blue-400 text-blue-800"
          )}>
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm dark:text-slate-400 text-blue-100 font-medium mb-1">
          {t(labelId)}
        </p>
        <h3 className="text-3xl font-bold text-white">{count}</h3>
      </div>
    </div>
  );
}

// 2. Recent Messages List
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvatarImage } from "@/components/ui/avatar";

export function RecentMessagesCard({ threads }: { threads: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg dark:text-white text-slate-900">
          {t("dashboard.recentMessages")}
        </h3>
        <Link href="/chat" className="text-sm dark:text-blue-400 text-blue-700 hover:underline transition-all">
          {t("dashboard.viewAll")}
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-blue-700/50 dark:bg-slate-900/50 p-6 flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-4 pt-2">
            {threads.length === 0 && (
              <p className="text-sm dark:text-slate-500 text-blue-100/60">
                {t("dashboard.noMessages")}
              </p>
            )}
            {threads.map((thread, i) => (
              <Link href={`/chat/${thread.id}`} key={i} className="flex gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors">
                <Avatar className="h-10 w-10 border border-white/10">
                  <AvatarImage src={thread.avatar} />
                  <AvatarFallback className="bg-slate-800 text-slate-300">{thread.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-medium text-white truncate">{thread.name}</h4>
                    <span className="text-xs dark:text-slate-500 text-blue-100/60">{thread.time}</span>
                  </div>
                  <p className="text-sm dark:text-slate-400 text-blue-100/80 truncate group-hover:opacity-80 transition-opacity">
                    {thread.preview}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// 3. Pending Tasks
export function PendingTasksCard({ tasks }: { tasks: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg dark:text-white text-slate-900">
          {t("dashboard.pendingTasks")}
        </h3>
        <Link href="/tasks">
          <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs text-white">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("dashboard.newTask")}
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-blue-700/50 dark:bg-slate-900/50 p-6 flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-4 pt-2">
            {tasks.length === 0 && (
              <p className="text-sm dark:text-slate-500 text-blue-100/60">
                {t("dashboard.noTasks")}
              </p>
            )}
            {tasks.map((task, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <button className={cn(
                  "mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-all",
                  task.done
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-600 hover:border-slate-500"
                )}>
                  {task.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1">
                  <p className={cn("text-sm font-medium transition-colors", task.done ? "dark:text-slate-500 text-white/40 line-through" : "text-white")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.dueText && (
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border",
                        task.urgent
                          ? "bg-red-500/15 border-red-500/50 text-red-400"
                          : "bg-orange-500/15 border-orange-500/50 text-orange-400"
                      )}>
                        {task.dueText}
                      </span>
                    )}
                    <span className="text-xs dark:text-slate-500 text-blue-200/60">{task.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

import { createNote } from "@/lib/actions/notes";
import React from "react";

// 4. Pinned Notes
export function PinnedNotesCard({ notes }: { notes: any[] }) {
  const [isPending, startTransition] = React.useTransition();
  const { t } = useTranslation();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createNote();
      } catch (err) {
        // redirect will happen on success, but just in case
        console.error(err);
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg dark:text-white text-slate-900">
          {t("dashboard.pinnedNotes")}
        </h3>
        <Button
          size="sm"
          className="h-8 bg-blue-600 hover:bg-blue-700 text-xs text-white"
          onClick={handleCreate}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1" />
          )}
          {t("dashboard.newNote")}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {notes.length === 0 && (
          <p className="text-sm dark:text-slate-500 text-slate-600 col-span-2">
            {t("dashboard.noNotes")}
          </p>
        )}
        {notes.map((note, i) => (
          <div key={i} className="rounded-2xl bg-blue-700/50 dark:bg-white/5 border border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <IconByType type={note.type} />
              </div>
              <h4 className="font-medium text-white mb-1 line-clamp-1">{note.title}</h4>
              <p className="text-xs dark:text-slate-400 text-blue-100/80 line-clamp-2">{note.excerpt}</p>
            </div>
            <p className="text-[10px] dark:text-slate-600 text-slate-200 mt-3 group-hover:opacity-80">
              {t("dashboard.updatedAt", { time: note.updatedAt })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function IconByType({ type }: { type: string }) {
  if (type === 'text') return <FileText className="h-4 w-4 text-orange-400" />
  if (type === 'idea') return <span className="text-sm">💡</span>
  return <FileText className="h-4 w-4 text-blue-300" />
}

// 5. Next Meeting (Blue Card)
export function NextMeetingCard() {
  return (
    <div className="rounded-2xl bg-blue-600 p-6 text-white h-full relative overflow-hidden">
      {/* Decor */}
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <span className="text-xs font-medium text-blue-200">Next Meeting</span>
          <h3 className="text-xl font-bold mt-1">Product Sync</h3>
        </div>

        <div className="flex items-center gap-2 text-sm bg-blue-700/50 w-fit px-3 py-1.5 rounded-lg border border-blue-500/30">
          <Clock className="h-4 w-4" />
          <span>3:00 PM - 4:00 PM</span>
        </div>
      </div>
    </div>
  )
}
