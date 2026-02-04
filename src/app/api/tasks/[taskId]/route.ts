import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { taskId } = await params;
  const body = await req.json();
  const { status } = body;

  // Validate status is one of the allowed enums
  if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    return new NextResponse("Invalid status", { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: taskId, authorId: user.id },
    data: { status }
  });

  return NextResponse.json(task);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { taskId } = await params;

  await prisma.task.delete({
    where: { id: taskId, authorId: user.id }
  });

  return new NextResponse(null, { status: 204 });
}