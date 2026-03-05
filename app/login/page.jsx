"use client"
import { useLanguage } from "@/lib/language-context"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { ref, get, set, serverTimestamp } from "firebase/database"
import { auth, realtimeDb, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import AuthLayout from "@/components/auth/AuthLayout"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

function LoginView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const role = searchParams.get("role") || "retailer"
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [show2FA, setShow2FA] = useState(false)
    const [otp, setOtp] = useState("")
    const [isRecovery, setIsRecovery] = useState(false)
    const [isEmailMode, setIsEmailMode] = useState(true)
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [emailRetryTimer, setEmailRetryTimer] = useState(0)
    const [emailSentOnce, setEmailSentOnce] = useState(false)
    const [twoFactorData, setTwoFactorData] = useState(null)
    const { isAuthenticated, role: authRole } = useAuth()

    useEffect(() => {
        // Verification log for the developer
        if (auth && auth.config) {
            console.log("Firebase initialized correctly with Project ID:", auth.config.authDomain?.split('.')[0]);
        } else {
            console.error("Firebase Auth object is not correctly initialized! Check lib/firebase.js");
        }

        // ONLY auto-redirect if:
        // 1. User is authenticated
        // 2. We have their role
        // 3. 2FA is NOT showing
        // 4. We are NOT currently "logging in" (isLoading)
        if (isAuthenticated && authRole && !show2FA && !isLoading) {
            router.push(authRole === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
        }
    }, [isAuthenticated, authRole, router, show2FA, isLoading]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    })

    async function handleLoginSuccess(submittedRole, email) {
        setIsLoading(true);
        // Set mock auth data
        localStorage.setItem('mock_user_role', JSON.stringify({ role: submittedRole, email }));

        // Simulate network delay
        setTimeout(() => {
            // Force reload to ensure AuthContext picks up the new mock state immediately on fresh load
            window.location.href = submittedRole === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard';
        }, 500);
    }

    async function onSubmit(values) {
        setIsLoading(true);
        try {
            const email = values.email.trim();
            const password = values.password;
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;

            // Fetch the user's role from RTDB to make sure we redirect to the right dashboard
            const userRef = ref(realtimeDb, `users/${user.uid}`);
            const snapshot = await get(userRef);

            let userRole = role; // Default to the role from the URL
            let dbData = {};
            if (snapshot.exists()) {
                dbData = snapshot.val();
                userRole = dbData.role || role;
            }

            // CHECK 2FA
            if (dbData.is2FAEnabled) {
                setTwoFactorData({
                    uid: user.uid,
                    email: user.email,
                    role: userRole,
                    encryptedSecret: dbData.twoFactorSecret,
                    recoveryCodes: dbData.recoveryCodes || []
                });
                setShow2FA(true);
                setIsLoading(false);
                return;
            }

            // ROLE MISMATCH CHECK (Choice B Enforcement)
            if (dbData.role && dbData.role !== role) {
                toast.warning(`This account is registered as a ${dbData.role.toUpperCase()}. Redirecting you to the correct dashboard...`);
                setTimeout(() => {
                    router.push(dbData.role === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
                }, 2000);
                setIsLoading(false);
                return;
            }

            // Redirect based on role if no 2FA
            router.push(userRole === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
        } catch (error) {
            console.error("Login failed full error object:", error);
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);

            let message = "Invalid email or password. Please try again.";

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                message = "Invalid credentials. \n\n🛡️ Troubleshooting:\n1. Check if you are on: " + window.location.origin + "\n2. Add this domain to 'Authorized Domains' in Firebase Console.\n3. If you used Google before, click the Google button below.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Account locked due to too many failed attempts. Try later.";
            } else if (error.code === 'auth/network-request-failed') {
                message = "Network error. Check your connection.";
            }

            toast.error(message, { duration: 6000 });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in RTDB
            const userRef = ref(realtimeDb, `users/${user.uid}`);
            const snapshot = await get(userRef);

            let finalRole = role; // Default to the role from the URL

            if (!snapshot.exists()) {
                // First-time login: Save user details
                const userData = {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    role: role, // Save the selected role
                    totalSales: 0
                };
                await set(userRef, userData);
                console.log("New user registered successfully in RTDB");

                // Send welcome email via Next.js API route
                try {
                    await fetch('/api/send-welcome-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.displayName,
                            role: role
                        }),
                    });
                } catch (emailError) {
                    console.error("Failed to send welcome email:", emailError);
                }
            }

            let dbData = snapshot.val() || {};
            finalRole = dbData.role || role;

            // ROLE MISMATCH CHECK for Google Login
            if (dbData.role && dbData.role !== role) {
                toast.warning(`You already have a ${dbData.role.toUpperCase()} account. Switching to your dashboard...`);
                setTimeout(() => {
                    router.push(dbData.role === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
                }, 2000);
                setIsLoading(false);
                return;
            }

            // CHECK 2FA for Google Login
            if (dbData.is2FAEnabled) {
                setTwoFactorData({
                    uid: user.uid,
                    email: user.email,
                    role: finalRole,
                    encryptedSecret: dbData.twoFactorSecret,
                    recoveryCodes: dbData.recoveryCodes || []
                });
                setShow2FA(true);
                setIsLoading(false);
                return;
            }

            // Redirect based on the final determined role
            router.push(finalRole === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onVerifyOTP(e) {
        if (e) e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/2fa/validate", {
                method: "POST",
                body: JSON.stringify({
                    otp,
                    uid: twoFactorData.uid,
                    encryptedSecret: twoFactorData.encryptedSecret,
                    recoveryCodes: twoFactorData.recoveryCodes,
                    isRecovery,
                    isEmailCode: isEmailMode
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.usedRecoveryIndex !== undefined) {
                // Update DB to remove used recovery code
                const newCodes = [...twoFactorData.recoveryCodes];
                newCodes.splice(data.usedRecoveryIndex, 1);
                await set(ref(realtimeDb, `users/${twoFactorData.uid}/recoveryCodes`), newCodes);
            }

            // Success! Redirect
            toast.success("Identity verified successfully");
            router.push(twoFactorData.role === 'wholesaler' ? '/wholesaler/dashboard' : '/retailer/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSendEmailCode() {
        console.log("2FA: Initiating email code send procedure...");
        if (isSendingEmail || emailRetryTimer > 0) {
            console.log("2FA: Aborting - Already sending or timer active.");
            return;
        }
        setIsSendingEmail(true);
        try {
            console.log("2FA: Sending request to /api/auth/2fa/send-email-code for", twoFactorData.email);
            const res = await fetch("/api/auth/2fa/send-email-code", {
                method: "POST",
                body: JSON.stringify({
                    uid: twoFactorData.uid,
                    email: twoFactorData.email
                })
            });
            const data = await res.json();
            console.log("2FA: API Response:", data);
            if (data.error) throw new Error(data.error);
            toast.success("Verification code sent to your email!");
            setOtp("");
            setEmailRetryTimer(60);
        } catch (err) {
            console.error("2FA Error in handleSendEmailCode:", err);
            toast.error(err.message || "Failed to send code");
        } finally {
            setIsSendingEmail(false);
        }
    }

    useEffect(() => {
        let timer;
        if (emailRetryTimer > 0) {
            timer = setTimeout(() => setEmailRetryTimer(emailRetryTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [emailRetryTimer]);

    // AUTO-SEND EMAIL CODE when 2FA is shown
    useEffect(() => {
        if (show2FA && isEmailMode && !emailSentOnce && twoFactorData?.email) {
            handleSendEmailCode();
            setEmailSentOnce(true);
        }
    }, [show2FA, isEmailMode, emailSentOnce, twoFactorData]);

    const { t } = useLanguage();
    const themeColor = role === 'wholesaler' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'
    const buttonColor = role === 'wholesaler' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'

    return (
        <AuthLayout
            role={role}
            title={t("welcomeBackUser").replace("{role}", role === 'wholesaler' ? t("partner") : t("shopper"))}
            subtitle={t("pleaseEnterDetails")}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                    {!show2FA ? (
                        <>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">{t("email")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder={t("email")}
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
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">{t("password")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={t("password")}
                                                    autoComplete="current-password"
                                                    className="pl-10 pr-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${role === 'wholesaler' ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                                    {isEmailMode ? (
                                        <Mail className={`w-8 h-8 ${role === 'wholesaler' ? 'text-amber-600' : 'text-emerald-600'}`} />
                                    ) : (
                                        <Lock className={`w-8 h-8 ${role === 'wholesaler' ? 'text-amber-600' : 'text-emerald-600'}`} />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold dark:text-white">
                                    {isEmailMode ? "Email Verification" : isRecovery ? "Recovery Account" : "Two-Factor Authentication"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isEmailMode ? `Enter the 6-digit code sent to ${twoFactorData?.email?.replace(/(.{2})(.*)(@.*)/, "$1***$3")}` : isRecovery ? "Enter one of your 8-character backup codes" : "Enter the 6-digit code from your app"}
                                </p>
                            </div>
                            <Input
                                type="text"
                                placeholder={isRecovery ? "REST-XXXX" : "000000"}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                                className="text-center text-2xl h-14 bg-muted border-border focus:bg-background transition-all rounded-xl dark:bg-white/5"
                            />

                            {isEmailMode && (
                                <div className="text-center">
                                    <button
                                        type="button"
                                        disabled={isSendingEmail || emailRetryTimer > 0}
                                        onClick={handleSendEmailCode}
                                        className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                                    >
                                        {isSendingEmail ? "Sending..." : emailRetryTimer > 0 ? `Resend code in ${emailRetryTimer}s` : "Didn't receive a code? Click here to resend"}
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={onVerifyOTP}
                                    className={`w-full h-11 rounded-full text-white font-semibold transition-all ${buttonColor}`}
                                    disabled={isLoading || otp.length < (isRecovery ? 4 : 6)}
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify & Continue
                                </Button>

                                <div className="flex flex-col gap-2 mt-2">
                                    {!isEmailMode && !isRecovery && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => { setIsRecovery(true); setIsEmailMode(false); setOtp(""); }}
                                                className="text-xs text-muted-foreground hover:text-foreground underline"
                                            >
                                                Use recovery code
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsEmailMode(true); setIsRecovery(false); setOtp(""); }}
                                                className="text-xs text-muted-foreground hover:text-foreground underline"
                                            >
                                                Verify via email instead
                                            </button>
                                        </>
                                    )}
                                    {(isEmailMode || isRecovery) && (
                                        <button
                                            type="button"
                                            onClick={() => { setIsEmailMode(false); setIsRecovery(false); setOtp(""); }}
                                            className="text-xs text-muted-foreground hover:text-foreground underline"
                                        >
                                            Use Authenticator App instead
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className={`data-[state=checked]:${role === 'wholesaler' ? 'bg-amber-600 border-amber-600' : 'bg-emerald-600 border-emerald-600'}`} />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground dark:text-white/60"
                            >
                                {t("rememberMe")}
                            </label>
                        </div>
                        <Link href="/forgot-password" className={`font-medium ${themeColor}`}>
                            {t("forgotPassword")}
                        </Link>
                    </div>

                    {!show2FA && (
                        <Button
                            type="submit"
                            className={`w-full h-11 rounded-full text-white font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${buttonColor}`}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("login")}
                        </Button>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border dark:border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground dark:bg-[#0a0a0a] dark:text-white/40">{t("orContinueWith")}</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-full border-border bg-background hover:bg-muted text-foreground font-medium transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        {t("google")}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground dark:text-white/60">
                        {t("dontHaveAccount")}{" "}
                        <Link href={`/register?role=${role}`} className={`font-semibold ${themeColor}`}>
                            {t("signUp")}
                        </Link>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginView />
        </Suspense>
    )
}
