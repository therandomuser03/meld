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

        const { requestId, action } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json({ error: "Missing requestId or action" }, { status: 400 });
        }

        const request = await prisma.connectionRequest.findUnique({
            where: { id: requestId },
            include: { fromUser: true, toUser: true }
        });

        if (!request || request.toUserId !== user.id) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (action === "accept") {
            await prisma.$transaction([
                // Update request status
                prisma.connectionRequest.update({
                    where: { id: requestId },
                    data: { status: "ACCEPTED" }
                }),
                // Create connection
                prisma.connection.create({
                    data: {
                        userAId: request.fromUserId < request.toUserId ? request.fromUserId : request.toUserId,
                        userBId: request.fromUserId < request.toUserId ? request.toUserId : request.fromUserId
                    }
                }),
                // Notify the sender
                prisma.notification.create({
                    data: {
                        userId: request.fromUserId,
                        title: "Connection Accepted",
                        body: `${user.user_metadata?.full_name || "Someone"} accepted your connection request.`,
                        link: "/connections"
                    }
                })
            ]);
            return NextResponse.json({ success: true, message: "Connection accepted" });
        } else if (action === "reject") {
            await prisma.connectionRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });
            return NextResponse.json({ success: true, message: "Request rejected" });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Connection respond error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
