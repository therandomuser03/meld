"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  FileText,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  MessageSquareCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "./sidebar-provider";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";

import { getUnreadCount } from "@/actions/chat";
import * as React from "react";

import { useTranslation } from "react-i18next";
import { ModeToggle } from "../ui/theme-changer";
import { LanguageSelector } from "../ui/language-selector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { t } = useTranslation();

  // Poll for unread messages
  React.useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    getUnreadCount(user.id).then(setUnreadCount);

    // Poll interval
    const interval = setInterval(async () => {
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", id: "nav.dashboard", icon: Home },
    { href: "/chat", id: "nav.chat", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { href: "/notes", id: "nav.notes", icon: FileText },
    { href: "/tasks", id: "nav.tasks", icon: CheckSquare },
    { href: "/connections", id: "nav.connections", icon: Users },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 border-r border-border bg-sidebar flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6 justify-between")}>
        <div className="flex items-center gap-3 font-bold text-xl text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <MessageSquareCode className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="whitespace-nowrap overflow-hidden"
              >
                {t("app.title", "Meld")}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Button */}
        {!isCollapsed && (
          <button onClick={toggleSidebar} className="text-sidebar-accent-foreground/70 hover:text-sidebar-foreground shrink-0 transition-colors">
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse Button (Bottom of header in collapsed mode) */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-center py-2 border-b border-border"
          >
            <button onClick={toggleSidebar} className="text-sidebar-accent-foreground/70 hover:text-sidebar-foreground p-2 transition-colors">
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors relative group",
                    isCollapsed ? "justify-center px-2" : "px-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-all", isCollapsed ? "h-5 w-5" : "")} />

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {t(item.id)}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && (
                    <span className={cn(
                      "flex items-center justify-center rounded-full bg-primary font-bold text-white transition-all duration-300",
                      isCollapsed ? "h-2 w-2 p-0 text-[0px] absolute top-2 right-2 border-2 border-sidebar" : "static h-5 w-5 text-[10px] ml-auto"
                    )}>
                      {!isCollapsed && item.badge}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={10} className="bg-secondary border-border text-text">
                  {t(item.id)}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className={cn(
        "flex items-center px-3 py-1 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
            >
              {t("common.theme")}
            </motion.span>
          )}
        </AnimatePresence>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex size-8 items-center justify-center">
              <ModeToggle />
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10} className="bg-secondary border-border text-text">
              {t("common.theme")}
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Language Selector */}
      <div className={cn(
        "flex items-center px-3 py-1 transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
            >
              {t("common.language")}
            </motion.span>
          )}
        </AnimatePresence>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex size-8 items-center justify-center">
              <LanguageSelector />
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10} className="bg-secondary border-border text-text">
              {t("common.language")}
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "flex items-center rounded-xl bg-sidebar-accent border border-border cursor-pointer hover:bg-sidebar-accent/80 transition-colors",
              isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto" : "gap-3 p-3"
            )}>
              <Avatar className={cn("border border-border shrink-0", isCollapsed ? "h-8 w-8" : "h-9 w-9")}>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.substring(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 overflow-hidden"
                  >
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? "start" : "end"} className="w-56 bg-secondary border-border text-text" side="right" sideOffset={10}>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer focus:bg-sidebar-accent">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("nav.settings")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-white/10 text-red-400 focus:text-red-400 focus:bg-red-500/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("common.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
