"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createNote() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Ensure user profile exists
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    if (!user.email) throw new Error("User email required");
    await prisma.userProfile.create({
      data: {
        id: user.id,
        email: user.email,
        preferredReadingLocale: "en", // Default
      }
    });
  }

  const note = await prisma.note.create({
    data: {
      title: "Untitled",
      body: "",
      authorId: user.id,
    },
  });

  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(noteId: string, data: { title?: string; body?: string; pinned?: boolean; tags?: string[] }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership or room access (simplifying to ownership for now)
  const existing = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existing || existing.authorId !== user.id) {
    // TODO: Check room access if room note
    throw new Error("Unauthorized to edit this note");
  }

  await prisma.note.update({
    where: { id: noteId },
    data: {
      ...data,
    }
  });

  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/notes");
}
