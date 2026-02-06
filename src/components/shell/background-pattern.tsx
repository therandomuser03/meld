"use client";

import { usePathname } from "next/navigation";
import { DotPattern } from "@/components/ui/dot-pattern";

export function BackgroundPattern() {
  const pathname = usePathname();
  const isConnectionsPage = pathname?.startsWith("/connections");

  if (isConnectionsPage) {
    return null;
  }

  return (
    <DotPattern
      width={30}
      height={30}
      cr={1.25}
      className="inset-0 -z-10 opacity-50 text-primary/50 dark:text-muted-foreground/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
    />
  );
}
