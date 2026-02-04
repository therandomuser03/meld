"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";
import { updateOnboardingProfile } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    profession: z.string().min(2, "Profession is required"),
    country: z.string().min(1, "Country is required"),
    bio: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY", "OTHER"]),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function OnboardingProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
    });

    const countryValue = watch("country");

    async function onSubmit(data: ProfileValues) {
        setIsLoading(true);
        try {
            const result = await updateOnboardingProfile(data);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            toast.success("Profile updated!");
            router.push("/onboarding/languages");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome to Meld</h1>
                <p className="text-slate-400">Let's set up your profile to get you started.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                        <Input
                            id="username"
                            placeholder="johndoe"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 pl-8"
                            {...register("username")}
                        />
                    </div>
                    {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Username must be unique</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="profession" className="text-white">Profession</Label>
                    <Input
                        id="profession"
                        placeholder="e.g. Software Engineer"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        {...register("profession")}
                    />
                    {errors.profession && <p className="text-xs text-red-500">{errors.profession.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-white">Country</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                                    !countryValue && "text-slate-500"
                                )}
                            >
                                {countryValue
                                    ? countries.find((country) => country.value === countryValue)?.label
                                    : "Select country"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                            <CommandItem
                                                value={country.label}
                                                key={country.value}
                                                onSelect={() => {
                                                    setValue("country", country.value, { shouldValidate: true });
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        country.value === countryValue ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {country.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-white">Gender</Label>
                    <Select onValueChange={(val) => setValue("gender", val as any)} defaultValue={watch("gender")}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                    {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-white">Bio <span className="text-slate-500 text-xs ml-1">(Optional)</span></Label>
                    <Textarea
                        id="bio"
                        placeholder="Building things with code and coffee."
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none min-h-[80px]"
                        {...register("bio")}
                    />
                </div>

                <Button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </Button>
            </form>
        </div>
    );
}
