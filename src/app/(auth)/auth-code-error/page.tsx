import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center p-4 bg-slate-950 text-white">
            <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
            <p className="text-slate-400 mb-8 max-w-md">
                There was a problem signing you in. The verification code may have expired or is invalid.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="default">
                    <Link href="/login">Try Login Again</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent border-slate-700 hover:bg-slate-900">
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </div>
    );
}
