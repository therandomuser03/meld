"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Github, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";

// Validation Schema
const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  profession: z.string().min(2, "Job title is required"),
  country: z.string().min(1, "Country is required"),
  gender: z.string().min(1, "Gender is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const countryValue = watch("country");

  async function onSubmit(data: SignupValues) {
    console.log("Submitting form data:", data);
    setIsLoading(true);
    try {
      // Sign up with extra metadata
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // This data is accessible in Supabase triggers to populate public.UserProfile
          data: {
            full_name: data.name,
            profession: data.profession,
            country: data.country,
            gender: data.gender,
          },
          // Redirect to the login page after email link click
          emailRedirectTo: `${window.location.origin}/callback?next=/login`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created! Check your email to verify.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSocialLogin(provider: "github" | "google") {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  // Debug errors
  console.log("Form Errors:", errors);

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {/* Name & Profession Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profession" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Profession</Label>
              <Input
                id="profession"
                placeholder="Developer"
                className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
                {...register("profession")}
              />
              {errors.profession && <p className="text-xs text-destructive">{errors.profession.message}</p>}
            </div>
          </div>

          {/* Country & Gender Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Country</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between bg-muted/50 border-input text-foreground hover:bg-muted hover:text-foreground h-11",
                      !countryValue && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {countryValue
                        ? countries.find((country) => country.value === countryValue)?.label
                        : "Select country"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 border-border bg-popover text-popover-foreground">
                  <Command className="bg-popover text-popover-foreground">
                    <CommandInput placeholder="Search country..." className="text-foreground" />
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
                            className="text-foreground hover:bg-accent hover:text-accent-foreground"
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
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Gender</Label>
              <Select onValueChange={(val) => setValue("gender", val)}>
                <SelectTrigger className="bg-muted/50 border-input text-foreground h-11">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Email</Label>
            <Input
              id="email"
              placeholder="name@company.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              className="bg-muted/50 border-input text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white w-full h-11 mt-2 shadow-lg shadow-blue-900/20 transition-all font-medium">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </div>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground">or with</span>
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          variant="outline"
          className="w-full h-11 font-normal relative"
          onClick={() => onSocialLogin("google")}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4 absolute left-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full h-11 font-normal relative"
          onClick={() => onSocialLogin("github")}
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4 absolute left-4" /> Continue with Github
        </Button>
      </div>

      <p className="text-center text-sm text-slate-500 mt-2">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium hover:underline underline-offset-4 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}