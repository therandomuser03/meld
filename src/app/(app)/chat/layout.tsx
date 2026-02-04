import { ThreadList } from "@/components/chat/thread-list";
import { getUserThreads } from "@/actions/chat";
import { createClient } from "@/lib/supabase/server";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated state if necessary, or let middleware handle it
    return <div>Please log in</div>;
  }

  const threads = await getUserThreads(user.id);

  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-950 bg-slate-300">
      {/* Middle Sidebar (Threads) */}
      <div className="hidden md:block h-full">
        <ThreadList initialThreads={threads} currentUserId={user.id} />
      </div>

      {/* Right Content (Active Chat) */}
      <main className="flex-1 h-full min-w-0 dark:bg-slate-950 bg-slate-300 border-white/5 border-l">
        {children}
      </main>
    </div>
  );
}