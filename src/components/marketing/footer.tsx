"use client";

import Link from "next/link";
import { MessageSquareCode, Github } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border-t border-border bg-background"
    >
      <div className="container px-4 md:px-6 py-12">
        {/* Main */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <MessageSquareCode className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-semibold text-lg text-foreground">
                Meld
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The seamless collaboration workspace for global teams.
              Chat, plan, and execute in any language.
            </p>
          </div>

          <Link
            href="https://github.com/therandomuser03/meld"
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center md:text-left">
          <p>© 2026 Meld Inc. All rights reserved.</p>
          <p>Powered by Next.js & Lingo.dev</p>
        </div>
      </div>
    </motion.footer>
  );
}
