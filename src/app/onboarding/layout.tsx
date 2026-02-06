import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquareCode } from "lucide-react";
import { ModeToggle } from "@/components/ui/theme-changer";

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
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-500">
            {/* Logo - Top Left */}
            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <MessageSquareCode className="h-5 w-5 text-white" />
                    </div>
                    <span>Meld</span>
                </Link>
            </div>

            {/* Mode Toggle - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <ModeToggle />
            </div>

            {/* Background Gradient Blob */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[120px] opacity-40" />
            </div>

            <div className="w-full space-y-8 relative z-10">
                {children}
            </div>
        </div>
    );
}
