"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
export function ProtectedRoute({ children, allowedRole, }) {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        // If not authenticated, redirect to home
        if (!isAuthenticated) {
            router.push("/");
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
        }
    }, [isAuthenticated, role, allowedRole, router, pathname]);
    // Show loading or nothing while redirecting
    if (!isAuthenticated || role !== allowedRole) {
        return (<div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>);
    }
    return <>{children}</>;
}
