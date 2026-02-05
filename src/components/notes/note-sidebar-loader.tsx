import prisma from "@/lib/prisma/client";
import { NoteNav } from "@/components/notes/note-nav";

export async function NoteSidebarLoader({ userId }: { userId: string }) {
    // Fetch notes for the list
    const notes = await prisma.note.findMany({
        where: { authorId: userId },
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
        where: { userId: userId },
        select: { roomId: true }
    });
    const roomIds = roomMemberships.map(rm => rm.roomId);

    const sharedNotes = await prisma.note.findMany({
        where: {
            OR: [
                {
                    roomId: { in: roomIds },
                    authorId: { not: userId },
                    visibility: 'ROOM'
                },
                {
                    authorId: { not: userId },
                    sharedWith: { some: { id: userId } },
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
            authorId: userId,
            visibility: { in: ['SHARED', 'ROOM'] }
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

    return <NoteNav notes={notes} sharedNotes={sharedNotes} sharedWithOthersNotes={sharedWithOthersNotes} />;
}
