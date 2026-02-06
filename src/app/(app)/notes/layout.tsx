import { createClient } from "@/lib/supabase/server";
import { NavigationBreadcrumb } from "@/components/common/navigation-breadcrumb";
import { Suspense } from "react";
import { NoteSidebarSkeleton } from "@/components/skeletons/notes-skeleton";
import { NoteSidebarLoader } from "@/components/notes/note-sidebar-loader";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-950 bg-slate-300">
      {/* Pane 1: Navigation & List (Merged) */}
      <aside className="hidden lg:flex flex-col border-r dark:border-white/10 border-black/5 dark:bg-slate-950 bg-slate-200 shrink-0">
        <Suspense fallback={<NoteSidebarSkeleton />}>
          <NoteSidebarLoader userId={user.id} />
        </Suspense>
      </aside>

      {/* Pane 2: Editor Area (Dynamic Children) */}
      <main className="flex-1 min-w-0 dark:bg-slate-900 bg-white dark:border-l-white/5 border-l-black/5 flex flex-col">
        <div className="p-2 pb-0">
          <NavigationBreadcrumb pageName="Notes" className="mb-2" />
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}
