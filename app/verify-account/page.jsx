"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, realtimeDb } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import {
    Mail,
    Phone,
    ArrowRight,
    RefreshCcw,
    ShieldCheck,
    CheckCircle2,
    Loader2,
    LogOut,
    Lock
} from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";

export default function VerifyAccountPage() {
    const { user, userData, role, isEmailVerified, isPhoneVerified, isAccountVerified, logout } = useAuth();
    const router = useRouter();

    const [method, setMethod] = useState(null); // 'email' or 'phone'

    // Email OTP states
    const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isResendingEmail, setIsResendingEmail] = useState(false);

    // Phone OTP states
    const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (isAccountVerified) {
            router.push(role === "wholesaler" ? "/wholesaler/dashboard" : role === "driver" ? "/driver/dashboard" : "/retailer/dashboard");
        }
    }, [user, isAccountVerified, role, router]);

    const handleOtpChange = (type, index, value) => {
        if (isNaN(value)) return;
        const setter = type === 'email' ? setEmailOtp : setPhoneOtp;
        const currentOtp = type === 'email' ? emailOtp : phoneOtp;

        const newOtp = [...currentOtp];
        newOtp[index] = value.substring(value.length - 1);
        setter(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`${type}-otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (type, index, e) => {
        if (e.key === "Backspace" && !(type === 'email' ? emailOtp : phoneOtp)[index] && index > 0) {
            const prevInput = document.getElementById(`${type}-otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const resendEmailOtp = async () => {
        setIsResendingEmail(true);
        try {
            await fetch('/api/auth/send-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    userId: user.uid,
                    name: userData?.name
                }),
            });
            toast.success("Verification code sent to your email!");
            setMethod('email');
        } catch (error) {
            toast.error("Failed to send code.");
        } finally {
            setIsResendingEmail(false);
        }
    };

    const verifyEmailOtp = async () => {
        const fullOtp = emailOtp.join("");
        if (fullOtp.length !== 6) return toast.error("Enter 6-digit code");

        console.log(`[Frontend] Verifying Email OTP for UID: ${user.uid}, Code: ${fullOtp}`);

        setIsVerifyingEmail(true);
        try {
            const res = await fetch('/api/auth/verify-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, otp: fullOtp }),
            });
            const data = await res.json();

            if (res.ok) {
                // Update User Profile now that OTP is valid
                await update(ref(realtimeDb, `users/${user.uid}`), { isEmailVerified: true });

                toast.success("Verified!");
                router.push(role === "wholesaler" ? "/wholesaler/dashboard" : role === "driver" ? "/driver/dashboard" : "/retailer/dashboard");
            } else {
                toast.error(data.error || "Invalid code");
                console.error("[Verify Error]:", data);
            }
        } catch (error) {
            toast.error("Verification failed connection.");
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const verifyPhoneOtp = async () => {
        const fullOtp = phoneOtp.join("");
        if (fullOtp.length !== 6) return toast.error("Enter 6-digit code");

        setIsVerifyingPhone(true);
        try {
            // SIMULATED PHONE OTP (Since real SMS requires paid Twilio config)
            if (fullOtp === "123456") {
                await update(ref(realtimeDb, `users/${user.uid}`), { isPhoneVerified: true });
                toast.success("Phone verified!");
                router.push(role === "wholesaler" ? "/wholesaler/dashboard" : role === "driver" ? "/driver/dashboard" : "/retailer/dashboard");
            } else {
                toast.error("Invalid code. Try 123456");
            }
        } catch (error) {
            toast.error("Verification failed.");
        } finally {
            setIsVerifyingPhone(false);
        }
    };

    if (!user) return null;

    return (
        <AuthLayout
            role={role}
            title="Account Verification"
            subtitle="Choose a method to verify your account"
        >
            <div className="space-y-6 w-full max-w-md mx-auto">

                {!method ? (
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => setMethod('email')}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">Email Address</h4>
                                <p className="text-xs text-muted-foreground">Verify using the code sent to {user.email}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500" />
                        </button>

                        <button
                            onClick={() => setMethod('phone')}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">Phone Number</h4>
                                <p className="text-xs text-muted-foreground">Verify via SMS to {userData?.phone}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500" />
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {method === 'email' && (
                            <div className="p-6 rounded-2xl bg-white/5 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <Mail className="w-5 h-5 text-emerald-500" />
                                    <h3 className="font-semibold text-white">Verify Email Code</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between gap-2">
                                        {emailOtp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`email-otp-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange('email', idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown('email', idx, e)}
                                                className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white"
                                            />
                                        ))}
                                    </div>
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-2">
                                        <Lock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-emerald-400/80 leading-snug">
                                            If email is delayed or rate-limited, use bypass code <b>999999</b>.
                                        </p>
                                    </div>
                                    <Button onClick={verifyEmailOtp} disabled={isVerifyingEmail} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl font-bold">
                                        {isVerifyingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                    </Button>
                                    <button onClick={() => setMethod(null)} className="w-full text-xs text-muted-foreground hover:text-white transition-colors">
                                        Try another method
                                    </button>
                                </div>
                            </div>
                        )}

                        {method === 'phone' && (
                            <div className="p-6 rounded-2xl bg-white/5 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-white">Verify Phone Code</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between gap-2">
                                        {phoneOtp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`phone-otp-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange('phone', idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown('phone', idx, e)}
                                                className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-white"
                                            />
                                        ))}
                                    </div>
                                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-2">
                                        <Lock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-blue-400/80 leading-snug">
                                            Real SMS requires a paid API. For development, use the bypass code <b>123456</b>.
                                        </p>
                                    </div>
                                    <Button onClick={verifyPhoneOtp} disabled={isVerifyingPhone} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold">
                                        {isVerifyingPhone ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                    </Button>
                                    <button onClick={() => setMethod(null)} className="w-full text-xs text-muted-foreground hover:text-white transition-colors">
                                        Try another method
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={logout} className="w-full text-sm text-muted-foreground hover:text-red-500 flex items-center justify-center gap-2 transition-colors py-4">
                    <LogOut className="w-4 h-4" />
                    Sign Out & Start Over
                </button>
            </div>
        </AuthLayout>
    );
}
