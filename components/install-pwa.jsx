"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure service worker is registered (next-pwa sometimes misses this in App Router)
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed: ", err);
      });
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Check if user dismissed it before
      if (localStorage.getItem("pwaPromptDismissed") === "true") {
        return;
      }
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect if already installed to not show the prompt
    window.addEventListener("appinstalled", () => {
      setIsReady(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsReady(false); // Hide the prompt if accepted
    }
    setDeferredPrompt(null);
  };

  if (!isReady) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border rounded-xl shadow-2xl z-50 p-4 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-foreground">Install Fruitflow App</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Add to home screen for faster access</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleInstallClick} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 h-8 text-xs">
          Install
        </Button>
        <button 
          onClick={() => {
            setIsReady(false);
            localStorage.setItem("pwaPromptDismissed", "true");
          }} 
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
