"use server";

import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

export async function syncUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user found" };
  }

  try {
    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (existingProfile) {
      return { success: true, isNew: false };
    }

    // Create new profile
    const metadata = user.user_metadata || {};

    // Determine a valid locale enum or default to "en" - simplified for now since we store string in UserProfile as per schema
    // Check schema: preferredReadingLocale is String @default("en")

    await prisma.userProfile.create({
      data: {
        id: user.id,
        email: user.email!, // Supabase users usually have email
        name: metadata.full_name || metadata.name || user.email?.split('@')[0] || "User",
        username: (metadata.username || user.email?.split('@')[0])?.toLowerCase(),
        avatarUrl: metadata.avatar_url || metadata.picture,
        profession: metadata.profession || null,
        region: metadata.country || null,
        gender: metadata.gender ? (metadata.gender as any) : undefined,
      }
    });

    return { success: true, isNew: true };
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return { error: "Failed to sync user profile" };
  }
}

export async function checkOnboardingStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { isOnboarded: true, profession: true, countryCode: true, region: true, username: true }
  });

  if (!profile) return { isOnboarded: false, isMissingFields: true };

  const isMissingFields = !profile.profession || !profile.region || !profile.username;

  return {
    isOnboarded: profile.isOnboarded,
    isMissingFields
  };
}
