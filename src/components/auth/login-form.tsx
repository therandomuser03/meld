"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { syncUser } from "@/lib/actions/auth";
import { Loader2, Github } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Invalid credentials.");
        return;
      }

      await syncUser();

      const { checkOnboardingStatus } = await import("@/lib/actions/auth");
      const status = await checkOnboardingStatus();

      toast.success("Logged in successfully!");

      if (status && !status.isOnboarded) {
        if (status.isMissingFields) {
          router.push("/onboarding/profile");
        } else {
          router.push("/onboarding/languages");
        }
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong.");
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

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Email Address</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-muted-foreground text-xs uppercase font-medium tracking-wide">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              className="bg-muted/50 border-input text-foreground focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            <div className="flex justify-end">
              <Link href="#" className="text-xs text-muted-foreground hover:text-blue-500 transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white w-full h-11 mt-2 shadow-lg shadow-blue-900/20 transition-all font-medium">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
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
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-medium hover:underline underline-offset-4 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}