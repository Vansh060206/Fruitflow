"use client"
import { useState } from "react"
import { Lock, ShieldCheck, RefreshCw, Mail, Key } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ref, update } from "firebase/database"
import { realtimeDb, auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function TwoFactorSetup({ roleColor = "emerald" }) {
    const { userData, logout } = useAuth();
    const [step, setStep] = useState(0); 
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    const accentColor = roleColor === "emerald" ? "emerald" : "purple";
    const bgAccent = `bg-${accentColor}-500/10`;
    const textAccent = `text-${accentColor}-600 dark:text-${accentColor}-500`;
    const btnAccent = `bg-${accentColor}-500 hover:bg-${accentColor}-600 shadow-${accentColor}-500/30 text-white`;

    const isPasswordProvider = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === "password"
    );

    const startSetup = () => {
        if (isPasswordProvider) {
            setStep(1); // Ask for password
        } else {
            sendEmailOTP(); // Directly send email OTP if Google Login
        }
    };

    const enable2FAinDB = async () => {
        setIsLoading(true);
        try {
            const userRef = ref(realtimeDb, `users/${userData.uid}`);
            await update(userRef, {
                is2FAEnabled: true,
                twoFactorSecret: "email-only", // Mock string since we don't use TOTP anymore
            });
            await fetch("/api/notify-2fa", {
                method: "POST",
                body: JSON.stringify({ email: userData.email, name: userData.name, status: "enabled" })
            });
            setStep(3);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
            setPassword("");
            setOtp("");
        }
    };

    const verifyPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            await enable2FAinDB();
        } catch (err) {
            if (err.code === "auth/wrong-password") {
                toast.error("Incorrect password");
            } else {
                toast.error(err.message);
            }
            setIsLoading(false);
        }
    };

    const sendEmailOTP = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/2fa/send-email-code", {
                method: "POST",
                body: JSON.stringify({ uid: userData.uid, email: userData.email })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            toast.success("Verification code sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmailOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/2fa/validate", {
                method: "POST",
                body: JSON.stringify({
                    otp,
                    uid: userData.uid,
                    isEmailCode: true
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await enable2FAinDB();
        } catch (err) {
            toast.error(err.message);
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm("Are you sure you want to disable 2FA?")) return;
        setIsLoading(true);
        try {
            const userRef = ref(realtimeDb, `users/${userData.uid}`);
            await update(userRef, {
                is2FAEnabled: false,
                twoFactorSecret: null,
            });
            await fetch("/api/notify-2fa", {
                method: "POST",
                body: JSON.stringify({ email: userData.email, name: userData.name, status: "disabled" })
            });
            setStep(0);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (userData?.is2FAEnabled && step === 0) setStep(3);

    return (
        <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${bgAccent} flex items-center justify-center`}>
                    <Lock className={`w-5 h-5 ${textAccent}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground dark:text-white">Security & 2FA</h3>
            </div>

            <div className="space-y-4">
                {step === 0 && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-muted border border-border rounded-xl dark:bg-white/5">
                            <Mail className="w-10 h-10 text-muted-foreground mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold dark:text-white">Email Two-Factor Authentication is OFF</p>
                                <p className="text-sm text-muted-foreground dark:text-white/60">
                                    Protect your account. When logging in, we will automatically send a secure 6-digit code to your email address.
                                </p>
                            </div>
                        </div>
                        <Button onClick={startSetup} disabled={isLoading} className={`w-full font-bold ${btnAccent}`}>
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Enable Email 2FA
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={verifyPassword} className="space-y-4 animate-in fade-in zoom-in-95">
                        <div className="space-y-2">
                            <Label className="text-base text-foreground">Confirm your password to enable 2FA</Label>
                            <Input
                                type="password"
                                placeholder="Enter your current password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button type="submit" disabled={isLoading} className={`w-full font-bold ${btnAccent}`}>
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Verify Identity"}
                            </Button>
                            <Button type="button" variant="outline" onClick={sendEmailOTP} disabled={isLoading}>
                                Forgot Password? Send code to email instead
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={verifyEmailOTP} className="space-y-4 animate-in fade-in zoom-in-95">
                        <div className="space-y-2 text-center">
                            <Label className="text-lg">Enter Email Code</Label>
                            <p className="text-sm text-muted-foreground mb-4">We sent a 6-digit code to {userData?.email}</p>
                            <Input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="text-center text-xl sm:text-2xl tracking-[0.5em] sm:tracking-[1em] font-bold h-14"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || otp.length < 6} className={`w-full font-bold ${btnAccent}`}>
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Verify and Enable 2FA"}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep(isPasswordProvider ? 1 : 0)}>
                            Cancel Setup
                        </Button>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                        <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl dark:bg-emerald-500/5">
                            <ShieldCheck className="w-10 h-10 text-emerald-600 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold text-emerald-600 dark:text-emerald-500">Email 2FA is ENABLED</p>
                                <p className="text-sm text-muted-foreground dark:text-white/60">
                                    Your account is fully protected. You will now receive an email code every time you log in to Fruitflow.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={disable2FA} disabled={isLoading} className="flex-1 text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/10">
                                Disable 2FA
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
