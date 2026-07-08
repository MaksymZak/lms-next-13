"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, GraduationCap, BookOpen } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import { DEMO_TEACHER, DEMO_STUDENT } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export const SignInForm = () => {
  const router = useRouter();
  const [pendingDemo, setPendingDemo] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;
  const isBusy = isSubmitting || !!pendingDemo;

  const signInWith = async (email: string, password: string) => {
    const { error } = await signIn.email({ email, password });

    if (error) {
      toast.error(error.message || "Invalid email or password");
      return;
    }

    toast.success("Welcome back!");
    router.push("/");
    router.refresh();
  };

  const onSubmit = async (values: FormValues) => {
    await signInWith(values.email, values.password);
  };

  const onDemo = async (demo: typeof DEMO_TEACHER, key: string) => {
    setPendingDemo(key);
    try {
      await signInWith(demo.email, demo.password);
    } finally {
      setPendingDemo(null);
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isBusy}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isBusy}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-x-2">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-slate-500">or try a demo</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => onDemo(DEMO_TEACHER, "teacher")}
        >
          {pendingDemo === "teacher" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GraduationCap className="mr-2 h-4 w-4" />
          )}
          Demo teacher
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => onDemo(DEMO_STUDENT, "student")}
        >
          {pendingDemo === "student" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="mr-2 h-4 w-4" />
          )}
          Demo student
        </Button>
      </div>
      <p className="text-center text-xs text-slate-500">
        Demo teacher has ready-made courses; demo student has purchases and
        progress.
      </p>
    </div>
  );
};
