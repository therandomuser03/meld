import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { z } from "zod";

const bioSchema = z.object({
    bio: z.string().max(250, "Bio must be less than 250 characters.").optional(),
});

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { id: user.id },
            select: { bio: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ bio: profile.bio });
    } catch (error) {
        console.error("Error fetching bio:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = bioSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { bio } = result.data;

        const updatedProfile = await prisma.userProfile.update({
            where: { id: user.id },
            data: { bio: bio || null }, // Handle empty string as null or save as is? Requirement says "handle null/empty values properly"
            select: { bio: true },
        });

        return NextResponse.json({ bio: updatedProfile.bio, message: "Bio updated successfully" });
    } catch (error) {
        console.error("Error updating bio:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
