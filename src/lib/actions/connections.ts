"use server";

import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function searchUsers(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  const users = await prisma.userProfile.findMany({
    where: {
      id: { not: user.id }, // Exclude self
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { profession: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
    select: {
      id: true,
      name: true,
      profession: true,
      bio: true,
      avatarUrl: true,
    },
  });

  // Get current user's connections
  const myConnections = await prisma.connection.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    select: { userAId: true, userBId: true }
  });
  const myConnIds = new Set(myConnections.map(c => c.userAId === user.id ? c.userBId : c.userAId));

  // Get mutual counts for each found user
  const usersWithMutuals = await Promise.all(users.map(async (u) => {
    const uConnections = await prisma.connection.findMany({
      where: { OR: [{ userAId: u.id }, { userBId: u.id }] },
      select: { userAId: true, userBId: true }
    });
    const uConnIds = uConnections.map(c => c.userAId === u.id ? c.userBId : c.userAId);
    const mutualCount = uConnIds.filter(id => myConnIds.has(id)).length;

    return { ...u, mutualCount };
  }));

  return usersWithMutuals;
}

export async function getMutualCounts(baseUserId: string, targetUsers: any[]) {
  // Get base user's connections
  const myConnections = await prisma.connection.findMany({
    where: { OR: [{ userAId: baseUserId }, { userBId: baseUserId }] },
    select: { userAId: true, userBId: true }
  });
  const myConnIds = new Set(myConnections.map(c => c.userAId === baseUserId ? c.userBId : c.userAId));

  // Get mutual counts for each target user
  const results = await Promise.all(targetUsers.map(async (u) => {
    const uConnections = await prisma.connection.findMany({
      where: { OR: [{ userAId: u.id }, { userBId: u.id }] },
      select: { userAId: true, userBId: true }
    });
    const uConnIds = uConnections.map(c => c.userAId === u.id ? c.userBId : c.userAId);
    const mutualCount = uConnIds.filter(id => myConnIds.has(id)).length;
    return { ...u, mutualCount };
  }));

  return results;
}
