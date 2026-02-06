"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquareCode, User } from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "../ui/theme-changer";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 border-b border-border/10 bg-background/80 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageSquareCode className="h-5 w-5 text-white" />
          </div>
          <span>Meld</span>
        </Link>
        <div className="flex items-center gap-4">
          
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-6 w-6 border-2 rounded-full" />
            Login
          </Link>
          <ModeToggle />
          {/* <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
            <Link href="/signup">Get Started</Link>
          </Button> */}
        </div>
      </div>
    </motion.nav>
  );
}