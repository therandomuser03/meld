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

        const { toUserId } = await req.json();

        if (!toUserId) {
            return NextResponse.json({ error: "Missing toUserId" }, { status: 400 });
        }

        if (user.id === toUserId) {
            return NextResponse.json({ error: "Cannot connect to yourself" }, { status: 400 });
        }

        // Check if already connected or pending
        const existingRequest = await prisma.connectionRequest.findFirst({
            where: {
                OR: [
                    { fromUserId: user.id, toUserId: toUserId },
                    { fromUserId: toUserId, toUserId: user.id }
                ]
            }
        });

        if (existingRequest) {
            return NextResponse.json({ error: "Request already exists" }, { status: 400 });
        }

        const existingConnection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { userAId: user.id, userBId: toUserId },
                    { userAId: toUserId, userBId: user.id }
                ]
            }
        });

        if (existingConnection) {
            return NextResponse.json({ error: "Already connected" }, { status: 400 });
        }

        // Create the request and notification
        const [request] = await prisma.$transaction([
            prisma.connectionRequest.create({
                data: {
                    fromUserId: user.id,
                    toUserId: toUserId,
                    status: "PENDING"
                }
            }),
            prisma.notification.create({
                data: {
                    userId: toUserId,
                    title: "New Connection Request",
                    body: `${user.user_metadata?.full_name || "Someone"} wants to connect with you.`,
                    link: "/connections"
                }
            })
        ]);

        return NextResponse.json({ success: true, request });
    } catch (error) {
        console.error("Connection request error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
