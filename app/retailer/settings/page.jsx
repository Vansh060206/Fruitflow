"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Mail, Store, Globe, Bell, Lock, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";
import { PasswordSettings } from "@/components/settings/PasswordSettings";
import { ref, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

function SettingsPageContent() {
  const { language, switchLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { userData, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    setMounted(true);
    if (userData) {
      setFormData({
        storeName: userData.storeName || userData.companyName || "",
        email: userData.email || "",
        phone: userData.phone || ""
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await update(ref(realtimeDb, `users/${user.uid}`), {
        storeName: formData.storeName,
        phone: formData.phone
      });
      toast.success("Profile settings updated!");
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-4xl overflow-x-hidden">
      {/* Profile Settings */}
      <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0ms" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white">Profile Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="shop-name" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Shop Name
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="shop-name" name="storeName" value={formData.storeName} onChange={handleChange} type="text" placeholder="Fresh Market Store" className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Email (Cannot be changed here)
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="email" type="email" disabled value={formData.email} className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground opacity-70 cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-white" />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 9999999999" className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" />
            </div>
          </div>

          <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "100ms" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white">Preferences</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted/80 transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                <div>
                  <p className="text-foreground font-medium dark:text-white">Push Notifications</p>
                  <p className="text-muted-foreground text-sm dark:text-white/60">Receive price alerts and order updates</p>
                </div>
              </div>
              <div className={`relative w-14 h-7 rounded-full transition-colors ${notificationsEnabled ? "bg-purple-500" : "bg-muted-foreground/30 dark:bg-white/20"}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationsEnabled ? "translate-x-7" : "translate-x-0"}`} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Language
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <select
                id="language"
                value={language}
                onChange={(e) => switchLanguage(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
              >
                <option value="en" className="bg-background text-foreground">
                  English
                </option>
                <option value="hi" className="bg-background text-foreground">
                  हिंदी (Hindi)
                </option>
              </select>
            </div>
          </div>
        </div>
      </Card >

      {/* Security */}
      <PasswordSettings roleColor="purple" />
      <TwoFactorSetup roleColor="purple" />

      {/* Danger Zone / Logout */}
      <Card className={`bg-red-500/5 border-red-500/20 p-6 transition-all duration-700 dark:bg-red-950/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "300ms" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Account Session</h3>
            <p className="text-sm text-muted-foreground dark:text-white/60">Sign out of your account on this device.</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                logout();
                window.location.href = "/";
              }
            }}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out Now
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
