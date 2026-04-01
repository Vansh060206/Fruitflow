"use client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { sendEmailVerification } from "firebase/auth";

export function EmailVerificationWall({ children }) {
    // Verification is now handled at the route level based on either Phone or Email.
    // If a user reaches here, they have satisfied the verification requirements.
    return <>{children}</>;
}
