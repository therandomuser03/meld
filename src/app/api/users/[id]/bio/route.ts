import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params are promises in Next.js 15+ (assuming latest based on other files using await params if applicable, but typical pattern is async params or direct access depending on version. Sticking to standard for App Router)
    // Actually, in App Router route handlers, params is the second argument.
    // Let's safe guard checking if params needs awaiting or not. 
    // Given user's environment might be Next 13/14/15.
    // Standard Next.js Type: { params: { id: string } } 
    // But recent update requires awaiting params in some cases.
    // I will assume standard object first as it's most common in Next 14.
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params if it's a promise (Next.js 15), otherwise use as is.
    // However, I can't easily detect version. I'll write it as a Promise just in case or use the type compatible wrapper?
    // Let's stick to the convention seen in the project if possible? I haven't seen other route handlers.
    // I'll use the safe approach: 
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { id },
            select: { bio: true, name: true, profession: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            bio: profile.bio,
            name: profile.name,
            profession: profile.profession
        });
    } catch (error) {
        console.error("Error fetching user bio:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
