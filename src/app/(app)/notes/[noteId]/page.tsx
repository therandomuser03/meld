import { Editor } from "@/components/notes/editor";
import prisma from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NoteEditorPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch note, checking ownership OR shared access
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      OR: [
        { authorId: user.id },
        { sharedWith: { some: { id: user.id } }, visibility: 'SHARED' },
        // { roomId: ... } // Future: check room membership
      ]
    },
    include: {
      sharedWith: { select: { id: true } }
    }
  });

  const [profile, allLanguages] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: user.id },
      include: {
        languages: {
          include: {
            language: true,
          },
        },
      },
    }),
    prisma.language.findMany({
      orderBy: { nameEnglish: "asc" },
    }),
  ]);

  if (!note) return <div>Note not found or you do not have permission to view it.</div>;

  const userLanguages = profile?.languages.map((l) => ({
    code: l.language.locale,
    name: l.language.nameEnglish,
  })) || [];

  const availableLanguages = allLanguages.map((l) => ({
    code: l.locale,
    name: l.nameEnglish,
  }));

  // Force cast note to any to match EditorProps which demands a specific structure if inferred types mismatch,
  // typically 'visibility' enum might need to be compatible.
  return <Editor note={note as any} userLanguages={userLanguages} availableLanguages={availableLanguages} currentUserId={user.id} />;
}