import { NextResponse } from "next/server";
import { ref, update, serverTimestamp } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req) {
    try {
        const { uid, email } = await req.json();
        console.log(`API 2FA: Request received for UID: ${uid}, EMAIL: ${email}`);

        if (!uid || !email) {
            console.warn("API 2FA: Missing UID or Email in request body");
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`API 2FA: Generated code ${code} for user ${uid}`);

        // Store in RTDB with expiry (e.g., 5 minutes from now)
        const userRef = ref(realtimeDb, `users/${uid}/tempVerification`);
        await update(userRef, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000,
            createdAt: serverTimestamp(),
        });

        // Send the email
        const emailSent = await sendVerificationCode(email, code);

        if (!emailSent) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Verification code sent to email" });
    } catch (error) {
        console.error("2FA Send Email Code Error:", error);
        return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
    }
}
