"use client";

import {
  MessageSquare,
  Pin,
  CheckCircle2,
  MoreHorizontal,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import React from "react";

// 1. Stat Card (Refactored for Moneywise look)
export function StatCard({
  labelId,
  count,
  badgeText,
  badgeColor,
  icon,
  trend,
  trendUp
}: {
  labelId: string;
  count: number | string;
  badgeText?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group shadow-sm">
      {/* Background Gradient Effect - Adjusted for light/dark compatibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] opacity-80" />
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
            {t(labelId)}
          </p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-card-foreground tracking-tight mb-2">{count}</h3>

          <div className="flex items-center gap-2">
            {(trend || badgeText) && (
              <div className={cn("px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1",
                badgeColor === "orange" ? "bg-accent/10 text-accent" :
                  badgeColor === "red" ? "bg-destructive/10 text-destructive" :
                    badgeColor === "green" ? "bg-primary/20 text-primary" :
                      "bg-primary/10 text-primary"
              )}>
                {trend || badgeText}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Recent Activity Section (Replaces Chart)
export function RecentActivitySection({ threads }: { threads: any[] }) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col p-6 rounded-3xl border border-border bg-card relative overflow-hidden shadow-sm">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-1">{t('dashboard.recentActivity', 'Recent Activity')}</h3>
          <p className="text-sm text-muted-foreground">Latest conversations and updates</p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground dark:hover:bg-white/5 hover:bg-black/5">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
        {threads.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            No recent activity
          </div>
        )}
        {threads.slice(0, 5).map((thread, i) => (
          <Link
            href={`/chat/${thread.id}`}
            key={i}
            className="flex items-center gap-4 group cursor-pointer hover:bg-accent/50 p-3 rounded-xl transition-colors border border-transparent hover:border-border animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Avatar className="h-10 w-10 border border-border shadow-sm">
              <AvatarImage src={thread.avatar} />
              <AvatarFallback className="bg-muted text-xs text-muted-foreground font-medium">{thread.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{thread.name}</p>
                <span className="text-[10px] text-muted-foreground font-mono">{thread.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">{thread.preview}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 2. Pinned Notes Card (Updated for Row 2)
export function PinnedNotesCard({ notes }: { notes: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col p-6 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">
          {t("dashboard.stats.pinned", "Pinned Notes")}
        </h3>
        <Link href="/notes">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {notes.slice(0, 5).map((note, i) => (
          <Link
            href={`/notes/${note.id}`}
            key={i}
            className="block group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Pin className="h-3 w-3 text-primary rotate-45" />
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 pl-5">
                {note.excerpt || "No content"}
              </p>
            </div>
          </Link>
        ))}
        {notes.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
            <Pin className="h-8 w-8 mb-2 opacity-20" />
            <p>No pinned notes</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Pending Tasks Section (Replaces Heatmap)
export function PendingTasksSection({ tasks }: { tasks: any[] }) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col p-6 rounded-3xl border border-border bg-card relative shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{t('dashboard.pendingTasks', 'Pending Tasks')}</h3>
          <p className="text-sm text-muted-foreground">High priority items needing attention</p>
        </div>
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground dark:hover:bg-white/5 hover:bg-black/5">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
            <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
            All caught up!
          </div>
        )}
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-all group">
            <div className={cn("flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border border-border",
              task.urgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            )}>
              {task.urgent ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors">{task.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.dueText || "No Date"}
                </span>
                {task.urgent && (
                  <span className="bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-wide uppercase">High</span>
                )}
              </div>
            </div>

            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full hover:bg-accent">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 3. Pending Tasks List (For Row 2)
export function PendingTasksList({ tasks }: { tasks: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col p-6 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">
          {t('dashboard.pendingTasks', 'Pending Tasks')}
        </h3>
        <Link href="/tasks">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {tasks.slice(0, 5).map((task, i) => (
          <div
            key={i}
            className="flex gap-3 items-center p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border border-border bg-muted text-muted-foreground",
              task.urgent && "bg-destructive/10 text-destructive border-destructive/10"
            )}>
              {task.urgent ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">{task.dueText || "No due date"}</span>
                {task.urgent && <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 rounded-sm font-bold uppercase tracking-wide">High</span>}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
            <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
            <p>{t("dashboard.noTasks")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
