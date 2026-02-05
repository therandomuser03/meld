import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col h-full">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}