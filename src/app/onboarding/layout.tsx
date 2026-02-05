import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Double check valid profile exists, if not syncUser should have run on login/callback.
    // We can assume it exists or handle gracefully.

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] opacity-40" />
            </div>

            <div className="w-full max-w-[500px] space-y-8 relative z-10">
                {children}
            </div>
        </div>
    );
}
