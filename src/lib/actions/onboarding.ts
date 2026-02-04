"use server";

import prisma from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  profession: z.string().min(2, "Profession is required"),
  country: z.string().min(1, "Country is required"),
  bio: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", "OTHER"]),
});

export async function updateOnboardingProfile(formData: z.infer<typeof profileSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const validData = profileSchema.parse(formData);

    // Check if username is taken
    const existing = await prisma.userProfile.findUnique({
      where: { username: validData.username.toLowerCase() }
    });

    if (existing && existing.id !== user.id) {
      return { error: "Username is already taken" };
    }

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        username: validData.username.toLowerCase(),
        profession: validData.profession,
        region: validData.country,
        bio: validData.bio,
        gender: validData.gender,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

const languagesSchema = z.object({
  languages: z.array(z.string()).min(1, "Select at least one language"),
  readingLocale: z.string().optional(),
});

export async function updateOnboardingLanguages(formData: z.infer<typeof languagesSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const { languages } = languagesSchema.parse(formData);
    let preferredLocale = "en";

    // Transaction to update languages
    await prisma.$transaction(async (tx) => {
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

      // Find the first language's locale
      if (languages.length > 0) {
        const firstLang = await tx.language.findUnique({
          where: { id: languages[0] },
          select: { locale: true }
        });
        if (firstLang) {
          preferredLocale = firstLang.locale;
        }
      }
    });

    // Update preferred locale outside the transaction to avoid driver issues with tx
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        preferredReadingLocale: preferredLocale
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating languages:", error);
    return { error: "Failed to update languages" };
  }
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { isOnboarded: true }
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { error: "Failed to complete onboarding" };
  }

  redirect("/dashboard");
}
