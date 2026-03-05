"use client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { sendEmailVerification } from "firebase/auth";

export function EmailVerificationWall({ children }) {
    const { user, isEmailVerified, logout } = useAuth();

    // For testing: if the role is mock, always show children (or not)
    // Actually, we should only block for real Firebase users.
    const needsVerification = user && !isEmailVerified;

    if (needsVerification) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[70vh]">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Mail className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4 text-center dark:text-white">Verification Required</h2>
                <p className="text-muted-foreground text-center max-w-md mb-8 dark:text-white/60">
                    We've sent a secure verification link to <strong className="text-foreground dark:text-white">{user.email}</strong>.
                    Please verify your email address to access your business dashboard.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Button
                        className="flex-1 rounded-full gap-2 bg-blue-600 hover:bg-blue-700 h-12"
                        onClick={async () => {
                            try {
                                await user.reload();
                                if (user.emailVerified) {
                                    toast.success("Verified! Welcome to FruitFlow.");
                                    setTimeout(() => window.location.reload(), 1000);
                                } else {
                                    toast.info("Still waiting for verification... (Check your spam).");
                                }
                            } catch (e) {
                                toast.error("Refresh failed. Try refreshing the browser.");
                            }
                        }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        I've Verified
                    </Button>

                    <Button
                        variant="outline"
                        className="flex-1 rounded-full gap-2 h-12 dark:bg-white/5"
                        onClick={async () => {
                            try {
                                await sendEmailVerification(user);
                                toast.success("New verification link sent! Please check your spam folder.");
                            } catch (e) {
                                console.error("Email Resend Error:", e);
                                if (e.code === 'auth/too-many-requests') {
                                    toast.error("Please wait a few minutes before resending.");
                                } else {
                                    toast.error(`Could not send: ${e.message}`);
                                }
                            }
                        }}
                    >
                        Resend Email
                    </Button>
                </div>

                <button
                    onClick={logout}
                    className="mt-8 text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out and use another email
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
