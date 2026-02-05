"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional().or(z.literal('')),
  bio: z.string().max(250).optional(),
  profession: z.string().optional(),
  avatarUrl: z.string().optional().nullable(),
  preferredReadingLocale: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", "OTHER"]).optional(),
  languages: z.array(z.string()).optional(),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  console.log("updateProfile rawData:", {
    hasAvatar: !!formData.get("avatarUrl"),
    avatarUrl: formData.get("avatarUrl"),
    name: formData.get("name")
  });

  const rawData = {
    name: formData.get("name") as string,
    username: (formData.get("username") as string)?.toLowerCase(),
    bio: formData.get("bio") as string,
    profession: formData.get("profession") as string,
    avatarUrl: formData.get("avatarUrl") as string, // will be null if missing
    preferredReadingLocale: formData.get("preferredReadingLocale") as string,
    gender: formData.get("gender") as string,
    languages: formData.getAll("languages") as string[],
  };

  try {
    const data = profileSchema.parse(rawData);
    const { languages, ...profileData } = data;

    await prisma.$transaction(async (tx) => {
      // Update profile
      await tx.userProfile.upsert({
        where: { id: user.id },
        update: profileData,
        create: {
          id: user.id,
          email: user.email!,
          ...profileData,
        },
      });

      // Update languages if provided
      if (languages) {
        // Clear existing
        await tx.userLanguage.deleteMany({
          where: { userId: user.id }
        });

        // Add new ones
        for (const langId of languages) {
          await tx.userLanguage.create({
            data: {
              userId: user.id,
              languageId: langId,
              type: "READING"
            }
          });
        }
      }
    });

    revalidatePath("/settings");
    revalidatePath("/", "layout"); // Update Sidebar and caching
    revalidatePath("/people"); // Update connections page
    return { success: "Profile updated successfully" };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return { error: "Username already taken" };
    }
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}
