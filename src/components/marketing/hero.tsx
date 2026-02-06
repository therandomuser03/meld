"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Ripple } from "@/components/ui/ripple";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] bg-primary/10 blur-[160px] rounded-full pointer-events-none" />
      <Ripple 
        mainCircleOpacity={0.3}
        mainCircleSize={320}
        className="[--foreground:var(--primary)] text-primary -translate-y-28" 
      />

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-green-400 px-3 py-1 text-sm font-medium text-green-800">
            Powered by Lingo.dev
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text max-w-5xl mb-8 leading-[1.1]"
        >
          Merge tasks, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            translate minds.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
        >
          The all-in-one workspace designed for seamless collaboration across borders.
          Real-time translation meets secure project management.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-background rounded-full px-8 h-12 text-base font-medium min-w-[160px]">
            <Link href="/signup">
              Start Building
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border bg-transparent hover:bg-secondary/50 text-text rounded-full px-8 h-12 text-base font-medium min-w-[160px]">
            <Link href="/#features">View Features</Link>
          </Button>
        </motion.div>
      </div>

      {/* Hero Image Mockup Area - Placeholder for Dashboard Screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="container px-4 md:px-6 mt-24 relative z-10"
      >
        <div className="rounded-xl border border-border bg-secondary/50 backdrop-blur-sm p-2 shadow-2xl">
          <div className="rounded-lg bg-background aspect-[16/9] w-full flex items-center justify-center text-muted-foreground border border-border/50">
            Dashboard Preview
          </div>
        </div>
      </motion.div>
    </section>
  );
}
