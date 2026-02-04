"use client";

import { MessageSquareCode } from "lucide-react";
import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">

      {/* Background Gradient Blob (optional, for subtle ambience) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-slate-900/60 border border-white/5 shadow-2xl rounded-2xl p-8 backdrop-blur-md">

        {/* Branding */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-blue-600/20">
              <MessageSquareCode className="h-6 w-6 text-white" />
            </div>
            <span>Meld</span>
          </Link>
          <div className="text-center space-y-1 mt-4">
            <h1 className="text-xl font-medium text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}