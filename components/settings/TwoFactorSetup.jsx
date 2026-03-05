"use client"
import { useState } from "react"
import { Lock, Smartphone, ShieldCheck, AlertCircle, RefreshCw, Copy, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ref, update } from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export function TwoFactorSetup({ roleColor = "emerald" }) {
    const { userData, logout } = useAuth();
    const [step, setStep] = useState(0); // 0: Disabled info, 1: QR Display, 2: OTP Verify, 3: Recovery Codes, 4: Enabled info
    const [isLoading, setIsLoading] = useState(false);
    const [setupData, setSetupData] = useState(null);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const accentColor = roleColor === "emerald" ? "emerald" : "purple";
    const bgAccent = `bg-${accentColor}-500/10`;
    const textAccent = `text-${accentColor}-600 dark:text-${accentColor}-500`;
    const btnAccent = `bg-${accentColor}-500 hover:bg-${accentColor}-600 shadow-${accentColor}-500/30`;

    const startSetup = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/2fa/generate", {
                method: "POST",
                body: JSON.stringify({ email: userData.email, name: userData.name })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSetupData(data);
            setStep(1);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const verifySetup = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                body: JSON.stringify({ otp, tempSecret: setupData.tempSecret })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Save to Database
            const userRef = ref(realtimeDb, `users/${userData.uid}`);
            await update(userRef, {
                is2FAEnabled: true,
                twoFactorSecret: data.finalSecret,
                recoveryCodes: data.recoveryCodes
            });

            // Notify via email
            await fetch("/api/notify-2fa", {
                method: "POST",
                body: JSON.stringify({ email: userData.email, name: userData.name, status: "enabled" })
            });

            setSetupData(prev => ({ ...prev, recoveryCodes: data.recoveryCodes }));
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;

        setIsLoading(true);
        try {
            const userRef = ref(realtimeDb, `users/${userData.uid}`);
            await update(userRef, {
                is2FAEnabled: false,
                twoFactorSecret: null,
                recoveryCodes: null
            });

            await fetch("/api/notify-2fa", {
                method: "POST",
                body: JSON.stringify({ email: userData.email, name: userData.name, status: "disabled" })
            });

            setStep(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Initial state based on DB
    if (userData?.is2FAEnabled && step === 0) setStep(4);

    return (
        <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 opacity-100 translate-y-0`}>
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
                            <Smartphone className="w-10 h-10 text-muted-foreground mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold dark:text-white">Two-Factor Authentication is OFF</p>
                                <p className="text-sm text-muted-foreground dark:text-white/60">
                                    Protect your account with an extra layer of security. After logging in, you'll be asked to provide a code from your authenticator app.
                                </p>
                            </div>
                        </div>
                        <Button onClick={startSetup} disabled={isLoading} className={`w-full ${btnAccent}`}>
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Enable 2FA
                        </Button>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm dark:text-white/80">Scan this QR code in Google Authenticator or Authy</p>
                            <img src={setupData.qrCodeUrl} alt="QR Code" className="w-48 h-48 border-4 border-white rounded-lg shadow-xl" />
                            <div className="w-full">
                                <p className="text-xs text-muted-foreground mb-1 uppercase">Or enter manually:</p>
                                <div className="flex gap-2 items-center bg-muted p-3 rounded-lg border dark:bg-white/5">
                                    <code className="flex-1 font-mono text-sm tracking-widest bg-transparent border-none focus:ring-0">{setupData.secret}</code>
                                    <button onClick={() => copyToClipboard(setupData.secret)} className="hover:text-foreground">
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => setStep(2)} className={`w-full ${btnAccent}`}>Next: Verify Code</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <p className="font-semibold dark:text-white text-lg">Enter the 6-digit code</p>
                            <p className="text-sm text-muted-foreground">Type the code displayed in your app to confirm setup</p>
                        </div>
                        <Input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="text-center text-2xl tracking-[1em] font-bold h-14"
                        />
                        {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                            <Button onClick={verifySetup} disabled={isLoading || otp.length < 6} className={`flex-1 ${btnAccent}`}>
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : "Complete Setup"}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-amber-600 dark:text-amber-500 font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Save Recovery Codes
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                If you lose your phone, these codes are the ONLY way to access your account. Store them securely.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-muted dark:bg-black/20 rounded-lg border font-mono">
                            {setupData.recoveryCodes.map(code => <div key={code} className="text-sm tracking-wider">{code}</div>)}
                        </div>
                        <Button onClick={() => setStep(4)} className={`w-full ${btnAccent}`}>I've saved them</Button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl dark:bg-emerald-500/5">
                            <ShieldCheck className="w-10 h-10 text-emerald-600 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold text-emerald-600 dark:text-emerald-500">2FA is ENABLED</p>
                                <p className="text-sm text-muted-foreground dark:text-white/60">
                                    Your account is fully protected. You'll be logged out now to verify your new security settings.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={disable2FA} disabled={isLoading} className="flex-1 text-red-500 hover:text-red-600">
                                Disable 2FA
                            </Button>
                            <Button onClick={() => { logout(); window.location.href = "/login"; }} className={`flex-1 ${btnAccent}`}>
                                Log out to test
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
