"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Mail, Store, Globe, Bell, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";
import { PasswordSettings } from "@/components/settings/PasswordSettings";

function SettingsPageContent() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Profile Settings */}
      <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "0ms" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white">Profile Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="name" type="text" defaultValue={userData?.name || "John Doe"} className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="email" type="email" defaultValue={userData?.email || "john@fruitflow.com"} className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" />
            </div>
          </div>

          <div>
            <label htmlFor="shop-name" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Shop Name
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input id="shop-name" type="text" defaultValue={userData?.companyName || userData?.storeName || "Fresh Fruits Wholesale"} className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40" />
            </div>
          </div>

          <button className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/30">
            Save Changes
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "100ms" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground dark:text-white">Preferences</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-muted-foreground mb-2 dark:text-white/60">
              Language
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <select id="language" className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white">
                <option value="en" className="bg-background text-foreground">
                  English
                </option>
                <option value="es" className="bg-background text-foreground">
                  Spanish
                </option>
                <option value="fr" className="bg-background text-foreground">
                  French
                </option>
                <option value="de" className="bg-background text-foreground">
                  German
                </option>
              </select>
            </div>
          </div>

          <div>
            <div
              className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg cursor-pointer hover:bg-muted/80 transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <div>
                  <p className="text-foreground font-medium dark:text-white">Push Notifications</p>
                  <p className="text-muted-foreground text-sm dark:text-white/60">Receive order and stock alerts</p>
                </div>
              </div>
              <div className={`relative w-14 h-7 rounded-full transition-colors ${notificationsEnabled ? "bg-emerald-500" : "bg-muted-foreground/30 dark:bg-white/20"}`}>
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationsEnabled ? "translate-x-7" : "translate-x-0"}`} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security */}
      <PasswordSettings roleColor="emerald" />
      <TwoFactorSetup roleColor="emerald" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <SettingsPageContent />
    </ProtectedRoute>
  );
}
