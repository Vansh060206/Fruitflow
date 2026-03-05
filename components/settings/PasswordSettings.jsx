"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast } from "sonner";

export function PasswordSettings({ roleColor = "emerald" }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isPasswordProvider = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === "password"
    );

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password should be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user found");

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            toast.success("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Password update error:", error);
            if (error.code === "auth/wrong-password") {
                toast.error("Incorrect current password");
            } else {
                toast.error(error.message || "Failed to update password");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isPasswordProvider) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-${roleColor}-500/10 flex items-center justify-center`}>
                        <Lock className={`w-5 h-5 text-${roleColor}-600 dark:text-${roleColor}-500`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground dark:text-white">Password Settings</h3>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">
                        Your account is linked with a third-party provider (e.g., Google).
                        Password management is handled by that provider.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-${roleColor}-500/10 flex items-center justify-center`}>
                    <Lock className={`w-5 h-5 text-${roleColor}-600 dark:text-${roleColor}-500`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground dark:text-white">Update Password</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                        <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full sm:w-auto bg-${roleColor}-600 hover:bg-${roleColor}-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-${roleColor}-500/30`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </Card>
    );
}
