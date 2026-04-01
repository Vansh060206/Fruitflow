"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
export function ProtectedRoute({ children, allowedRole, }) {
    const { isAuthenticated, role, isAccountVerified } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If not authenticated, redirect to home
        if (!isAuthenticated) {
            router.push("/");
            return;
        }

        // If authenticated but not verified, and not already on the verify page, redirect
        if (!isAccountVerified && pathname !== "/verify-account") {
            router.push("/verify-account");
            return;
        }

        // If authenticated but wrong role, redirect to correct dashboard
        if (role !== allowedRole) {
            if (role === "wholesaler") {
                router.push("/wholesaler/dashboard");
            }
            else if (role === "retailer") {
                router.push("/retailer/dashboard");
            }
            else if (role === "driver") {
                router.push("/driver/dashboard");
            }
        }
    }, [isAuthenticated, role, allowedRole, router, pathname, isAccountVerified]);

    // Show loading or nothing while redirecting
    if (!isAuthenticated || role !== allowedRole || !isAccountVerified) {
        if (pathname === "/verify-account") return <>{children}</>;
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white text-lg">Verifying access...</div>
            </div>
        );
    }
    return <>{children}</>;
}
