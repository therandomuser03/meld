import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUser } from "@/lib/actions/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it, otherwise default to dashboard
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await syncUser();

      const { checkOnboardingStatus } = await import("@/lib/actions/auth");
      const status = await checkOnboardingStatus();

      if (status && !status.isOnboarded) {
        if (status.isMissingFields) {
          return NextResponse.redirect(`${origin}/onboarding/profile`);
        }
        return NextResponse.redirect(`${origin}/onboarding/languages`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback error:", error);
    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth-code-error`);

  }
}