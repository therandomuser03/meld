import { createClient } from "@/lib/supabase/server";
import { NavigationBreadcrumb } from "@/components/common/navigation-breadcrumb";
import { Suspense } from "react";
import { ChatListSkeleton } from "@/components/skeletons/chat-skeleton";
import { ChatSidebarLoader } from "@/components/chat/chat-sidebar-loader";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated state if necessary, or let middleware handle it
    return <div>Please log in</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-950 bg-slate-300 ">
      {/* Middle Sidebar (Threads) */}
      <div className="hidden md:block h-full border-r dark:border-white/10 border-black/5 dark:bg-slate-950 bg-slate-200">
        <Suspense fallback={<ChatListSkeleton />}>
          <ChatSidebarLoader userId={user.id} />
        </Suspense>
      </div>

      {/* Right Content (Active Chat) */}
      <main className="flex-1 h-full min-w-0 dark:bg-slate-900 bg-white dark:border-l-white/5 border-l-black/5 flex flex-col">
        <div className="p-2 pb-0">
          <NavigationBreadcrumb pageName="Chat" className="mb-2" />
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}