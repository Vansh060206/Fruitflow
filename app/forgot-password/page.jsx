"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/auth/AuthLayout";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

function ForgotPasswordView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "retailer";
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { t } = useLanguage();

    const themeColor = role === 'wholesaler' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700';
    const buttonColor = role === 'wholesaler' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values) {
        setIsLoading(true);
        try {
            const email = values.email.trim();
            // Firebase handles the reset email logic securely out of the box
            await sendPasswordResetEmail(auth, email);
            setIsEmailSent(true);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Password reset error:", error);
            
            let message = "Failed to send reset email. Please try again.";
            if (error.code === 'auth/user-not-found') {
                // For security, it's often better not to reveal if an email exists, 
                // but Firebase throws this currently.
                message = "No account found with this email address.";
            } else if (error.code === 'auth/invalid-email') {
                message = "The email address is invalid.";
            }

            toast.error(message, { duration: 5000 });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            role={role}
            title="Reset Password"
            subtitle="We'll send you a secure link to reset your password."
        >
            {!isEmailSent ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Email Address</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Enter your registered email"
                                                autoComplete="email"
                                                className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className={`w-full h-11 rounded-full text-white font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${buttonColor}`}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>

                        <div className="text-center text-sm mt-6">
                            <Link href={`/login?role=${role}`} className={`flex items-center justify-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors`}>
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </Form>
            ) : (
                <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <KeyRound className="w-10 h-10 text-emerald-500" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Email Sent!</h3>
                        <p className="text-muted-foreground text-sm max-w-[280px]">
                            If an account exists for <span className="font-semibold text-foreground">{form.getValues().email}</span>, you will receive a password reset link shortly.
                        </p>
                    </div>

                    <div className="pt-4 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/login?role=${role}`)}
                            className="w-full h-11 rounded-full border-border bg-background hover:bg-muted text-foreground font-medium transition-all"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Login
                        </Button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}>
            <ForgotPasswordView />
        </Suspense>
    );
}
