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
        <div className="space-y-6 max-w-[500px] mx-auto">
            <div className="space-y-2 text-center pb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome to Meld</h1>
                <p className="text-muted-foreground text-sm">Let's set up your profile to get you started.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                    <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">@</span>
                        <Input
                            id="username"
                            placeholder="johndoe"
                            className="bg-background border-input text-foreground placeholder:text-muted-foreground pl-9 focus:ring-primary/50 focus:border-primary/50 transition-all rounded-xl shadow-sm h-12"
                            {...register("username")}
                        />
                    </div>
                    {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Username must be unique</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="profession" className="text-foreground font-medium">Profession</Label>
                    <Input
                        id="profession"
                        placeholder="e.g. Software Engineer"
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50 transition-all rounded-xl shadow-sm h-12"
                        {...register("profession")}
                    />
                    {errors.profession && <p className="text-xs text-red-500 mt-1">{errors.profession.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-foreground font-medium">Country</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    "w-full justify-between bg-background border-input text-foreground hover:bg-muted hover:text-foreground rounded-xl px-3 font-normal h-12 shadow-sm",
                                    !countryValue && "text-muted-foreground"
                                )}
                            >
                                {countryValue
                                    ? countries.find((country) => country.value === countryValue)?.label
                                    : "Select country"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-input bg-popover text-popover-foreground">
                            <Command className="bg-transparent">
                                <CommandInput placeholder="Search country..." className="border-b border-input" />
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
                                                className="aria-selected:bg-accent aria-selected:text-accent-foreground"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        country.value === countryValue ? "opacity-100 text-primary" : "opacity-0"
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
                    {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label className="text-foreground font-medium">Gender</Label>
                    <Select onValueChange={(val) => setValue("gender", val as any)} defaultValue={watch("gender")}>
                        <SelectTrigger className="bg-background border-input text-foreground rounded-xl focus:ring-primary/50 focus:border-primary/50 shadow-sm h-12">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-input text-popover-foreground">
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                            <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-foreground font-medium">Bio <span className="text-muted-foreground text-xs ml-1 font-normal">(Optional)</span></Label>
                    <Textarea
                        id="bio"
                        placeholder="Building things with code and coffee."
                        className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none min-h-[100px] focus:ring-primary/50 focus:border-primary/50 transition-all rounded-xl p-3 shadow-sm"
                        {...register("bio")}
                    />
                </div>

                <Button disabled={isLoading} className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-xl mt-4">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </Button>
            </form>
        </div>
    );
}
