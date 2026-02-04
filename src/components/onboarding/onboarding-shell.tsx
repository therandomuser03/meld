"use client";

import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OnboardingShellProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
}

export function OnboardingShell({ children, step, totalSteps, title, description }: OnboardingShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visual/Context */}
        <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-600/20 to-purple-600/10 p-8 flex flex-col justify-between border-r border-white/5 relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" /> {/* Optional pattern */}
          
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">SetChat</span>
          </div>

          <div className="relative z-10">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium text-white">
                "Intelligence is the ability to adapt to change."
              </p>
              <footer className="text-xs text-slate-400">— Stephen Hawking</footer>
            </blockquote>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 md:p-10">
          <div className="flex justify-between items-start mb-6">
             <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {title} 
                    <span className="text-2xl">🎉</span>
                </h1>
                <p className="text-sm text-slate-400">
                    {description}
                </p>
             </div>
             {/* Close button (optional, maybe logs out) */}
             {/* <button className="text-slate-500 hover:text-white transition-colors">
                 <X className="h-5 w-5" />
             </button> */}
          </div>

          {children}

          {/* Progress Dots */}
          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i + 1 === step ? "w-8 bg-blue-600" : "w-1.5 bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}