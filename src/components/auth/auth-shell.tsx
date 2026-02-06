"use client";

import { MessageSquareCode } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/theme-changer";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
      
      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Background Gradient Blob (optional, for subtle ambience) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-card/60 border border-border shadow-2xl rounded-2xl p-8 backdrop-blur-md transition-colors duration-500">

        {/* Branding */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-blue-600/20">
              <MessageSquareCode className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>Meld</span>
          </Link>
          <div className="text-center space-y-1 mt-4">
            <h1 className="text-xl font-medium text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}