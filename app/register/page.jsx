"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Lock, Mail, User, Loader2, Store, Phone, MapPin, CheckCircle2, Truck, Hash } from "lucide-react"
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth"
import { ref, set, get, serverTimestamp, query, orderByChild, equalTo } from "firebase/database"
import { auth, realtimeDb, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { toast } from "sonner"

import { useLanguage } from "@/lib/language-context"

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
import AuthLayout from "@/components/auth/AuthLayout"

const formSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .refine((val) => !["asdf", "qwerty", "test", "abc", "123"].includes(val.toLowerCase()), "Please enter a real name"),
    email: z.string()
        .email("Please enter a valid business email address")
        .refine((email) => {
            const forbidden = ["dummy", "test", "example", "fake", "temp", "tempmail", "mailinator", "123", "abc", "asdf", "qwerty", "xyz"];
            return !forbidden.some(word => email.toLowerCase().includes(word));
        }, "This email address is restricted. Please use a real business email."),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Include one uppercase letter")
        .regex(/[a-z]/, "Include one lowercase letter")
        .regex(/[0-9]/, "Include one number")
        .regex(/[^A-Za-z0-9]/, "Include one special character"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
    phone: z.string()
        .length(10, "Phone number must be exactly 10 digits")
        .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number")
        .refine((phone) => {
            // Rejects common dummy numbers and repeating digits (e.g. 9999999999)
            const isRepeating = /^(\d)\1{9}$/.test(phone);
            const isSequential = "9876543210".includes(phone) || "1234567890".includes(phone);
            const commonDummies = ["1234567890", "9876543210", "1020304050", "1122334455", "5544332211"];
            return !isRepeating && !isSequential && !commonDummies.includes(phone);
        }, "Invalid mobile number (dummy or repeating sequence detected)"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    vehicleNumber: z.string().optional(),
    vehicleType: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

function RegisterView() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const role = searchParams.get("role") || "retailer"
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { isAuthenticated, role: authRole } = useAuth()

    useEffect(() => {
        // Verification log for the developer
        if (auth && auth.config) {
            console.log("Firebase initialized correctly on Register page with Project ID:", auth.config.authDomain?.split('.')[0]);
        }

        if (isAuthenticated && authRole) {
            router.push(authRole === 'wholesaler' ? '/wholesaler/dashboard' : authRole === 'driver' ? '/driver/dashboard' : '/retailer/dashboard');
        }
    }, [isAuthenticated, authRole, router]);
    const { t } = useLanguage()

    const themeColor = role === 'wholesaler' ? 'text-amber-600 hover:text-amber-700' : role === 'driver' ? 'text-purple-600 hover:text-purple-700' : 'text-emerald-600 hover:text-emerald-700'
    const buttonColor = role === 'wholesaler' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' : role === 'driver' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'


    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            phone: "",
            city: "",
            state: "",
            country: "",
            vehicleNumber: "",
            vehicleType: "Bike",
        },
    })

    async function handleLoginSuccess(submittedRole, email) {
        setIsLoading(true);
        // Set mock auth data
        localStorage.setItem('mock_user_role', JSON.stringify({ role: submittedRole, email }));

        // Simulate network delay
        setTimeout(() => {
            window.location.href = submittedRole === 'wholesaler' ? '/wholesaler/dashboard' : submittedRole === 'driver' ? '/driver/dashboard' : '/retailer/dashboard';
        }, 500);
    }

    async function onSubmit(values) {
        setIsLoading(true);

        if (role === 'driver') {
            let hasError = false;
            if (!values.vehicleNumber || values.vehicleNumber.trim() === '') {
                form.setError("vehicleNumber", { type: "manual", message: "Vehicle Number is required for drivers" });
                hasError = true;
            }
            if (!values.vehicleType || values.vehicleType.trim() === '') {
                form.setError("vehicleType", { type: "manual", message: "Vehicle Type is required for drivers" });
                hasError = true;
            }
            if (hasError) {
                setIsLoading(false);
                return;
            }
        } else {
            let hasError = false;
            if (!values.companyName || values.companyName.trim().length < 3) {
                form.setError("companyName", { type: "manual", message: "Company/Store name must be at least 3 characters" });
                hasError = true;
            } else if (["asdf", "qwerty", "test", "none", "blank", "123"].includes(values.companyName.toLowerCase())) {
                form.setError("companyName", { type: "manual", message: "Please enter a real company/store name" });
                hasError = true;
            }
            if (hasError) {
                setIsLoading(false);
                return;
            }
        }
        try {
            const email = values.email.trim();
            const phone = values.phone.trim();

            // Check if phone number already exists in RTDB
            const phoneQuery = query(ref(realtimeDb, 'users'), orderByChild('phone'), equalTo(phone));
            const phoneSnapshot = await get(phoneQuery);

            if (phoneSnapshot.exists()) {
                toast.error("This phone number is already linked to an account.");
                setIsLoading(false);
                return;
            }

            const result = await createUserWithEmailAndPassword(auth, email, values.password);
            const user = result.user;

            console.log("Registration successful! User UID:", user.uid);

            // Send Email OTP
            try {
                const otpRes = await fetch('/api/auth/send-email-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        userId: user.uid,
                        name: values.name
                    }),
                });

                if (otpRes.ok) {
                    toast.success("Account created! A 6-digit verification code has been sent to your email.");
                } else {
                    const errorData = await otpRes.json();
                    toast.error(`Account created, but email failed: ${errorData.details || "SMTP Error"}`);
                }
            } catch (otpError) {
                console.error("Failed to send initial OTP:", otpError);
            }

            // Also send a welcome email through our reliable NodeMailer API
            try {
                await fetch('/api/send-welcome-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        name: values.name,
                        role: role
                    }),
                });
            } catch (emailError) {
                console.error("Failed to send welcome email API:", emailError);
            }

            // Save user details to RTDB
            const userData = {
                uid: user.uid,
                name: values.name,
                email: user.email,
                companyName: values.companyName,
                phone: values.phone,
                location: `${values.city}, ${values.state}, ${values.country}`,
                city: values.city,
                state: values.state,
                country: values.country,
                createdAt: serverTimestamp(),
                role: role,
                totalSales: 0,
                isVerified: false,
                ...(role === 'driver' && {
                    vehicleNumber: values.vehicleNumber,
                    vehicleType: values.vehicleType,
                    driverStatus: "offline"
                })
            };
            await set(ref(realtimeDb, `users/${user.uid}`), userData);

            // Redirect to a 'Please Verify' page
            router.push("/verify-account");
        } catch (error) {
            // Suppress console error if it's a known user-correction error
            if (error.code !== 'auth/email-already-in-use') {
                console.error("Registration failed:", error);
            }

            if (error.code === 'auth/email-already-in-use') {
                toast.error("This email is already registered. Please login to your account.");
                setTimeout(() => router.push(`/login?role=${role}`), 3000);
            } else if (error.code === 'auth/invalid-email') {
                toast.error("The email address is invalid.");
            } else if (error.code === 'auth/weak-password') {
                toast.error("The password is too weak.");
            } else {
                toast.error(error.message || "Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userRef = ref(realtimeDb, `users/${user.uid}`);
            const snapshot = await get(userRef);

            let finalRole = role;

            if (!snapshot.exists()) {
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

                // Send welcome email
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
            } else {
                finalRole = snapshot.val().role || role;

                // ROLE MISMATCH CHECK for Google Login
                if (snapshot.val().role && snapshot.val().role !== role) {
                    toast.warning(`You are already registered as a ${snapshot.val().role.toUpperCase()}. Switching dashboards...`);
                    setTimeout(() => {
                        router.push(snapshot.val().role === 'wholesaler' ? '/wholesaler/dashboard' : snapshot.val().role === 'driver' ? '/driver/dashboard' : '/retailer/dashboard');
                    }, 2000);
                    setIsLoading(false);
                    return;
                }
            }

            router.push(finalRole === 'wholesaler' ? '/wholesaler/dashboard' : finalRole === 'driver' ? '/driver/dashboard' : '/retailer/dashboard');
        } catch (error) {
            console.error("Google login failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            role={role}
            title={t("createAccount")}
            subtitle={t("joinAsRole").replace("{role}", role === 'wholesaler' ? t("wholesaler") : t("retailer"))}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">{t("fullName")}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder={t("fullName")} className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {role !== 'driver' && (
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Company Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Company Name" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Phone Number</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Phone Number (10 digits)" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">City</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="City" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">State</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="State" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Country</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Country" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground placeholder:text-muted-foreground dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {role === 'driver' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="vehicleNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Vehicle Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="Vehicle Number (e.g. MH01)" className="pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Vehicle Type</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Truck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <select
                                                    className="w-full pl-10 h-11 bg-muted border-border focus:bg-background transition-all rounded-full text-foreground appearance-none"
                                                    {...field}
                                                >
                                                    <option value="" disabled>Select Vehicle</option>
                                                    <option value="Bike">Bike</option>
                                                    <option value="Auto">Auto</option>
                                                    <option value="Pickup">Pickup</option>
                                                    <option value="Tempo">Tempo</option>
                                                    <option value="Mini Truck">Mini Truck</option>
                                                </select>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

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
                                            placeholder={t("emailAddress")}
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
                                            autoComplete="new-password"
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

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Confirm Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
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
                        className={`w-full h-11 rounded-full text-white font-semibold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${buttonColor} ${(!form.formState.isValid || isLoading) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        disabled={isLoading || !form.formState.isValid}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("register")}
                    </Button>

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
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        {t("google")}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground dark:text-white/60">
                        {t("alreadyHaveAccount")}{" "}
                        <Link href={`/login?role=${role}`} className={`font-semibold ${themeColor}`}>
                            {t("login")}
                        </Link>
                    </div>
                </form>
            </Form>
        </AuthLayout>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterView />
        </Suspense>
    )
}
