"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
    onAuthStateChanged,
    signOut as firebaseSignOut
} from "firebase/auth"
import { auth } from "@/lib/firebase"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [userData, setUserData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!auth) {
            console.warn("Firebase Auth not initialized.");
            setIsLoading(false);
            return;
        }

        // We can't use 'require' dynamically easily in some environments, 
        // but here it's fine as it's client-side. 
        // Better to import them at the top if possible, but firebase.js might already handle it.
        const setupRealtimeSync = async (currentUser) => {
            const { ref, onValue } = await import("firebase/database");
            const { realtimeDb } = await import("@/lib/firebase");

            const userRef = ref(realtimeDb, `users/${currentUser.uid}`);

            return onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setUserData(data);
                    setRole(data.role);
                } else {
                    console.warn("User profile not yet setup in RTDB (expected during signup).");
                    setUserData(null);
                    setRole(null);
                }
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching user data:", error);
                setIsLoading(false);
            });
        };

        let unsubscribeRtdb = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // If there was a previous RTDB subscription, clean it up
                if (unsubscribeRtdb) unsubscribeRtdb();
                unsubscribeRtdb = await setupRealtimeSync(currentUser);
            } else {
                if (unsubscribeRtdb) unsubscribeRtdb();
                setUserData(null);
                setRole(null);
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeRtdb) unsubscribeRtdb();
        };
    }, [])

    const logout = async () => {
        try {
            if (typeof window !== 'undefined') localStorage.removeItem('mock_user_role');
            if (auth) await firebaseSignOut(auth);
            setUser(null);
            setRole(null);
            setUserData(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white text-lg">Loading profile...</div>
            </div>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                userData,
                isAuthenticated: !!user,
                isEmailVerified: user?.emailVerified || false,
                isLoading,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
