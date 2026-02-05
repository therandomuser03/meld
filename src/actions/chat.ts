"use server";

import prisma from "@/lib/prisma/client";

export async function getThreadMessages(threadId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        threadId: threadId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function getThreadDetails(threadId: string) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        userA: true,
        userB: true,
        room: true,
      }
    });
    return thread;
  } catch (error) {
    console.error("Error fetching thread details:", error);
    return null;
  }
}

export async function getUserThreads(userId: string) {
  try {
    const threads = await prisma.thread.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
          {
            room: {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          }
        ]
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true, email: true } },
        userB: { select: { id: true, name: true, avatarUrl: true, email: true } },
        room: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { name: true } }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    return [];
  }
}

export async function getConnectedUsers(userId: string) {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ]
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true, profession: true } },
        userB: { select: { id: true, name: true, avatarUrl: true, profession: true } },
      }
    });

    // Transform to flat list of "other" users
    const users = connections.map(c => {
      if (c.userAId === userId) return { ...c.userB, role: c.userB.profession || "Member" };
      return { ...c.userA, role: c.userA.profession || "Member" };
    });

    return users;
  } catch (error) {
    console.error("Error fetching connected users:", error);
    return [];
  }
}

export async function getOrCreateDirectThread(currentUserId: string, otherUserId: string) {
  try {
    // Enforce canonical ordering (A < B)
    const [userAId, userBId] = [currentUserId, otherUserId].sort();

    // Try to find existing
    const existing = await prisma.thread.findFirst({
      where: {
        type: "DIRECT",
        userAId,
        userBId,
      }
    });

    if (existing) return existing.id;

    // Create new
    const newThread = await prisma.thread.create({
      data: {
        type: "DIRECT",
        userAId,
        userBId,
      }
    });

    return newThread.id;
  } catch (error) {
    console.error("Error in getOrCreateDirectThread:", error);
    throw new Error("Failed to initialize conversation");
  }
}

export async function sendMessage(threadId: string, authorId: string, content: string) {
  try {
    const message = await prisma.message.create({
      data: {
        threadId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Update thread lastMessageAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date(), lastMessageAt: new Date() }
    });

    // Mark as read for sender so they don't see their own message as unread
    await markThreadAsRead(threadId, authorId);

    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
}

export async function createGroupThread(currentUserId: string, name: string, memberIds: string[]) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Room
      const room = await tx.room.create({
        data: {
          name,
          ownerId: currentUserId,
          members: {
            create: [
              { userId: currentUserId, role: "OWNER" },
              ...memberIds.map(id => ({ userId: id, role: "MEMBER" as const }))
            ]
          }
        }
      });

      // 2. Create the Thread linked to the Room
      const thread = await tx.thread.create({
        data: {
          type: "ROOM",
          roomId: room.id,
        }
      });

      return thread;
    });

    return result.id;
  } catch (error) {
    console.error("Error creating group thread:", error);
    throw new Error("Failed to create group");
  }
}

// Lingo SDK setup
import { LingoDotDevEngine } from "lingo.dev/sdk";
const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGO_API_KEY as string,
});

export async function translateMessage(messageId: string, targetLocale: string) {
  try {
    // 1. Check Cache
    const cached = await prisma.translation.findFirst({
      where: {
        messageId,
        targetLocale,
        entityType: "MESSAGE"
      }
    });

    if (cached) return cached.translatedContent;

    // 2. Fetch Message Content
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) throw new Error("Message not found");

    // 3. Call Translation Service
    const translatedText = await lingo.localizeText(message.content, {
      targetLocale,
      sourceLocale: message.sourceLocale || null,
    });

    // 4. Cache Result
    // Generate a simple hash of content for uniqueness constraint if needed, 
    // or rely on messageId+targetLocale uniqueness.
    // The schema uses unique([entityType, messageId, targetLocale, contentHash])
    const crypto = require('crypto');
    const contentHash = crypto.createHash('sha256').update(`PLAIN:${message.content}`).digest('hex');

    await prisma.translation.create({
      data: {
        entityType: "MESSAGE",
        messageId,
        targetLocale,
        translatedContent: translatedText,
        contentFormat: "PLAIN",
        contentHash,
      }
    });

    return translatedText;
  } catch (error) {
    console.error("Translation action error:", error);
    throw new Error("Failed to translate message");
  }
}

export async function markThreadAsRead(threadId: string, userId: string) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { room: { include: { members: true } } }
    });

    if (!thread) return;

    const now = new Date();

    if (thread.type === "DIRECT") {
      if (thread.userAId === userId) {
        await prisma.thread.update({ where: { id: threadId }, data: { userALastReadAt: now } });
      } else if (thread.userBId === userId) {
        await prisma.thread.update({ where: { id: threadId }, data: { userBLastReadAt: now } });
      }
    } else if (thread.type === "ROOM" && thread.roomId) {
      // Update RoomMember
      await prisma.roomMember.update({
        where: {
          roomId_userId: {
            roomId: thread.roomId,
            userId: userId
          }
        },
        data: { lastReadAt: now }
      });
    }
  } catch (error) {
    console.error("Error marking thread read:", error);
  }
}

export async function getUnreadCount(userId: string) {
  try {
    // 1. Get all threads for user
    const threads = await prisma.thread.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
          { room: { members: { some: { userId } } } }
        ] // Only fetch threads with new messages to save time? 
        // Hard to filter in where clause due to dynamic "lastRead".
        // Fetching all active threads is fine for now.
      },
      include: {
        room: { include: { members: { where: { userId } } } }
      }
    });

    // 2. Count unread messages
    let totalUnread = 0;

    for (const thread of threads) {
      let lastRead = new Date(0); // Default too old

      if (thread.type === "DIRECT") {
        if (thread.userAId === userId) lastRead = thread.userALastReadAt || new Date(0);
        else if (thread.userBId === userId) lastRead = thread.userBLastReadAt || new Date(0);
      } else if (thread.type === "ROOM") {
        const member = thread.room?.members[0];
        lastRead = member?.lastReadAt || new Date(0);
      }

      // Check if lastMessageAt is newer (quick check)
      if (thread.lastMessageAt && thread.lastMessageAt > lastRead) {
        const count = await prisma.message.count({
          where: {
            threadId: thread.id,
            createdAt: { gt: lastRead },
            authorId: { not: userId } // Don't count own messages
          }
        });
        totalUnread += count;
      }
    }

    return totalUnread;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
