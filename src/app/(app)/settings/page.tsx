import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      profession: true,
      bio: true,
      preferredReadingLocale: true,
      gender: true,
      languages: {
        include: {
          language: true
        }
      }
    }
  });

  if (!profile) redirect("/login");

  // Fetch all available languages for the selector
  const allLanguages = await prisma.language.findMany({
    orderBy: { nameEnglish: 'asc' }
  });

  return (
    <div className="space-y-6">
      <ProfileForm
        user={{
          id: profile.id,
          email: profile.email,
          name: profile.name,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
          profession: profile.profession,
          bio: profile.bio,
          preferredReadingLocale: profile.preferredReadingLocale,
          gender: profile.gender
        }}
        selectedLanguageIds={profile.languages.map(l => l.languageId)}
        availableLanguages={allLanguages}
      />
    </div>
  );
}