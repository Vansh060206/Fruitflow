"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
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

        // Force-clear loading state after 10 seconds as a final fallback
        const loadingTimer = setTimeout(() => {
            if (isLoading) {
               console.warn("Auth initialization timed out after 10s. Force-clearing loading state.");
               setIsLoading(false);
            }
        }, 10000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
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
            clearTimeout(loadingTimer);
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

    const value = useMemo(() => ({
        user,
        role,
        userData,
        isAuthenticated: !!user,
        isEmailVerified: user?.emailVerified || userData?.isEmailVerified || false,
        isPhoneVerified: userData?.isPhoneVerified || false,
        isAccountVerified: (user?.emailVerified || userData?.isEmailVerified) || (userData?.isPhoneVerified || false),
        isLoading,
        logout
    }), [user, role, userData, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white text-lg">Loading profile...</div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
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
