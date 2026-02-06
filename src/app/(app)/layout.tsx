import { SidebarProvider } from "@/components/shell/sidebar-provider";
import { Shell } from "@/components/shell/shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DotPattern } from "@/components/ui/dot-pattern";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch basic profile info for sidebar
  const { data: dbProfile } = await supabase
    .from("UserProfile")
    .select("name, avatarUrl")
    .eq("id", user.id)
    .single();

  const profile = {
    name: dbProfile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    email: user.email,
    avatarUrl: dbProfile?.avatarUrl || user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };

  return (
    <div className="relative min-h-screen dark:bg-slate-950 bg-slate-300 dark:text-slate-50 text-slate-900 transition-colors duration-500 z-0">
      <DotPattern
        width={30}
        height={30}
        cr={1.25}
        className="inset-0 -z-10 opacity-50 text-primary/50 dark:text-muted-foreground/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
      />
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <SidebarProvider>
          <Shell userProfile={profile}>
            {children}
          </Shell>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}