import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { requestId } = await req.json();

        if (!requestId) {
            return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
        }

        const request = await prisma.connectionRequest.findUnique({
            where: { id: requestId }
        });

        if (!request || request.fromUserId !== user.id) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        await prisma.connectionRequest.delete({
            where: { id: requestId }
        });

        return NextResponse.json({ success: true, message: "Request cancelled" });
    } catch (error) {
        console.error("Connection cancel error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
