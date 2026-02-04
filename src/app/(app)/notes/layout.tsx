import { NoteNav } from "@/components/notes/note-nav";
// import { NoteList } from "@/components/notes/note-list";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch notes for the list
  const notes = await prisma.note.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      body: true,
      updatedAt: true,
      pinned: true,
      tags: true
    }
  });

  // Fetch shared notes
  const roomMemberships = await prisma.roomMember.findMany({
    where: { userId: user.id },
    select: { roomId: true }
  });
  const roomIds = roomMemberships.map(rm => rm.roomId);

  const sharedNotes = await prisma.note.findMany({
    where: {
      OR: [
        {
          roomId: { in: roomIds },
          authorId: { not: user.id },
          visibility: 'ROOM'
        },
        {
          authorId: { not: user.id },
          sharedWith: { some: { id: user.id } },
          visibility: 'SHARED'
        }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      body: true,
      updatedAt: true,
      tags: true,
      author: {
        select: {
          name: true,
          avatarUrl: true
        }
      }
    }
  });


  const sharedWithOthersNotes = await prisma.note.findMany({
    where: {
      authorId: user.id,
      visibility: { in: ['SHARED', 'ROOM'] } // Or just SHARED if ROOM implies shared via room
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      body: true,
      updatedAt: true,
      tags: true,
      sharedWith: {
        select: {
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return (
    <div className="flex h-screen overflow-hidden dark:bg-slate-950 bg-slate-300">
      {/* Pane 1: Navigation & List (Merged) */}
      <aside className="hidden lg:flex flex-col border-r dark:border-white/10 border-black/5 dark:bg-slate-950 bg-slate-200 shrink-0">
        <NoteNav notes={notes} sharedNotes={sharedNotes} sharedWithOthersNotes={sharedWithOthersNotes} />
      </aside>

      {/* Pane 2: Editor Area (Dynamic Children) */}
      <main className="flex-1 min-w-0 dark:bg-slate-900 bg-white dark:border-l-white/5 border-l-black/5">
        {children}
      </main>
    </div>
  );
}