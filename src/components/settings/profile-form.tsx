"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2, Link as LinkIcon, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal('')),
  profession: z.string().optional(),
  bio: z.string().max(250, "Bio must be less than 250 characters.").optional(),
  preferredReadingLocale: z.string(),
  autoTranslate: z.boolean(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", "OTHER"]),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  avatarUrl: z.string().optional().nullable(),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    profession: string | null;
    bio: string | null;
    preferredReadingLocale: string;
    gender: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" | "OTHER" | null;
  };
  selectedLanguageIds: string[];
  availableLanguages: { id: string; nameEnglish: string; nativeName: string | null; locale: string }[];
}

export function ProfileForm({ user, selectedLanguageIds, availableLanguages }: ProfileFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { setLocale } = useLanguage();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      profession: user.profession || "",
      bio: user.bio || "",
      preferredReadingLocale: user.preferredReadingLocale || "en",
      autoTranslate: true,
      gender: user.gender || "PREFER_NOT_TO_SAY",
      languages: selectedLanguageIds,
      avatarUrl: user.avatarUrl || null,
    },
  });

  const onSubmit = async (data: ProfileValues) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "languages" && Array.isArray(value)) {
          value.forEach(langId => formData.append("languages", langId));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const result = await updateProfile(null, formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Sync the UI locale immediately
      setLocale(data.preferredReadingLocale);

      toast.success("Profile updated successfully");
      router.refresh(); // Refresh to get updated server data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      form.setValue('avatarUrl', publicUrl, { shouldDirty: true });
      toast.success("Image uploaded!");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Error uploading avatar");
    } finally {
      setIsUploading(false);
      // Reset input so duplicate selection triggers change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue('avatarUrl', null, { shouldDirty: true });
    toast.info("Avatar removed. Click Save to apply.");
  };

  const selectedLanguages = form.watch("languages");
  const avatarUrl = form.watch("avatarUrl");

  const toggleLanguage = (id: string) => {
    const current = selectedLanguages || [];
    if (current.includes(id)) {
      form.setValue("languages", current.filter(l => l !== id), { shouldValidate: true });
    } else {
      form.setValue("languages", [...current, id], { shouldValidate: true });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between dark:bg-slate-900/50 bg-white p-6 rounded-2xl border dark:border-white/5 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900 mb-1">Profile Settings</h1>
          <p className="dark:text-slate-400 text-slate-500 text-sm">Update your personal information and how others see you on Meld.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => form.reset()} className="dark:text-slate-400 text-slate-500 hover:text-red-500 hover:bg-red-500/10">Discard</Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-lg shadow-blue-900/20"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Section 1: Avatar */}
      <section className="dark:bg-slate-900/50 bg-white border dark:border-white/5 border-slate-200 rounded-2xl p-8">
        <div className="flex items-start gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 dark:border-slate-950 border-white shadow-2xl">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="bg-orange-200 text-orange-700 text-3xl font-bold">
                {user.name?.substring(0, 2).toUpperCase() || "SC"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-1">Profile Picture</h3>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                We recommend an image of at least 400x400px. GIFs are supported for Pro users.
              </p>
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
            />
            <div className="flex gap-3">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                type="button"
              >
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload New
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="dark:bg-white/5 bg-slate-50 dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-600 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-slate-900 bg-white dark:border-white/10 border-slate-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white text-slate-900">Remove profile picture?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-slate-400 text-slate-500">
                      This will remove your current profile picture and revert to your initials. You need to save changes to make this permanent.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent dark:text-slate-300 text-slate-600 dark:hover:bg-white/5 hover:bg-slate-100 dark:hover:text-white dark:border-white/10 border-slate-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveAvatar} className="bg-red-600 text-white hover:bg-red-700 border-none">Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Personal Info */}
      <section className="dark:bg-slate-900/50 bg-white border dark:border-white/5 border-slate-200 rounded-2xl p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold dark:text-white text-slate-900 mb-1">Personal Information</h3>
          <p className="text-sm text-slate-500">These details are public to all Meld users.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Gender</Label>
            <Select
              defaultValue={form.getValues("gender")}
              onValueChange={(val) => form.setValue("gender", val as any)}
            >
              <SelectTrigger className="dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 h-11 focus-visible:ring-blue-600">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Username</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">@</span>
              <Input
                {...form.register("username")}
                className="pl-8 dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 h-11 focus-visible:ring-blue-600 focus-visible:border-blue-600/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Full Name</Label>
          <Input
            {...form.register("name")}
            className="dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 h-11 focus-visible:ring-blue-600 focus-visible:border-blue-600/50"
          />
          {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-2.5">
          <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Bio</Label>
          <Textarea
            {...form.register("bio")}
            placeholder="Product Designer & Tech Enthusiast..."
            className="dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 min-h-[120px] resize-none focus-visible:ring-blue-600 focus-visible:border-blue-600/50 p-4 leading-relaxed"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-slate-600">{form.watch("bio")?.length || 0}/250 characters</span>
          </div>
        </div>
      </section>

      {/* Section 3: Languages */}
      <section className="dark:bg-slate-900/50 bg-white border dark:border-white/5 border-slate-200 rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-4 border-b dark:border-white/5 border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <span className="text-blue-500 font-bold text-lg">文</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-slate-900">Language Preferences</h3>
            <p className="text-sm text-slate-500">Customize your translation and display settings.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Selected Languages</Label>
            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">
              {selectedLanguages.length} selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggleLanguage(lang.id)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all border flex flex-col items-center justify-center gap-1 text-center",
                  selectedLanguages.includes(lang.id)
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "dark:bg-slate-950 bg-white dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span>{lang.nameEnglish}</span>
                {lang.nativeName && <span className={cn("text-[9px] opacity-60", selectedLanguages.includes(lang.id) ? "text-blue-100" : "text-slate-500")}>{lang.nativeName}</span>}
              </button>
            ))}
          </div>
          {form.formState.errors.languages && (
            <p className="text-xs text-red-500">{form.formState.errors.languages.message}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-white/5 border-slate-200 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium dark:text-white text-slate-900">Primary Display Language</Label>
            <p className="text-xs text-slate-500">This is your main language across the whole app.</p>
          </div>
          <Select
            defaultValue={form.getValues("preferredReadingLocale")}
            onValueChange={(val) => form.setValue("preferredReadingLocale", val)}
          >
            <SelectTrigger className="w-full md:w-[200px] dark:bg-slate-900 bg-white dark:border-white/10 border-slate-200 dark:text-white text-slate-900 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages
                .filter(lang => selectedLanguages.includes(lang.id))
                .map(lang => (
                  <SelectItem key={lang.id} value={lang.locale}>
                    {lang.nameEnglish}
                  </SelectItem>
                ))}
              {/* Fallback */}
              {!selectedLanguages.some(id => availableLanguages.find(l => l.id === id)?.locale === form.watch("preferredReadingLocale")) && (
                <SelectItem value={form.getValues("preferredReadingLocale")}>
                  {availableLanguages.find(l => l.locale === form.getValues("preferredReadingLocale"))?.nameEnglish || "English"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-5 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-white/5 border-slate-200">
          <div className="space-y-1">
            <Label className="text-sm font-medium dark:text-white text-slate-900">Auto-translate messages</Label>
            <p className="text-xs text-slate-500">Automatically translate messages that aren't in your primary language.</p>
          </div>
          <Switch
            checked={form.watch("autoTranslate")}
            onCheckedChange={(val) => form.setValue("autoTranslate", val)}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </section>

      {/* Sign Out */}
      {/* <div className="pt-4">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 pl-0"
        >
          <LogOut className="h-4 w-4" />
          Sign out from all devices
        </Button>
      </div> */}
    </div>
  );
}