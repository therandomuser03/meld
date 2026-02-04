"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

export async function toggleNoteVisibility(noteId: string, isShared: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // TODO: Check ownership? Assume yes for now or validation inside
    await prisma.note.update({
        where: { id: noteId, authorId: user.id },
        data: {
            visibility: isShared ? "SHARED" : "PRIVATE",
            // If turning private, removing shared users? User requirements "not accessible". 
            // Keeping relation is safer but ensuring UI respects visibility.
            // But if toggled back to private, access should be revoked. 
            // Let's clear shared list if made private? No, maybe preserve for later.
            // The visibility flag governs access.
        }
    });

    revalidatePath(`/notes/${noteId}`);
}

export async function shareNoteWithUsers(noteId: string, userIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Update logic: set shares
    await prisma.note.update({
        where: { id: noteId, authorId: user.id },
        data: {
            sharedWith: {
                set: userIds.map(id => ({ id }))
            }
        }
    });

    revalidatePath(`/notes/${noteId}`);
}
