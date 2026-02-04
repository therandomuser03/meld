import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await request.json();
        const { title, date, priority, startDate, endDate, isAllDay } = json;

        const task = await prisma.task.create({
            data: {
                title,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                isAllDay: isAllDay || false,
                priority: priority || "MEDIUM",
                authorId: user.id,
                status: 'TODO'
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
