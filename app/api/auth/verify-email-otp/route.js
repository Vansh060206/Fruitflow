import { NextResponse } from 'next/server';
import { ref, get, remove, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export async function POST(req) {
    try {
        const { userId, otp } = await req.json();
        console.log(`[Verify] Attempt for User: ${userId}, Received OTP: ${otp}`);

        if (!userId || !otp) {
            return NextResponse.json({ error: 'User ID and OTP are required' }, { status: 400 });
        }

        // DEV BYPASS: Allow 999999 for instant testing even if DB record doesn't exist
        if (otp === "999999") {
            console.log(`[Verify] DEV BYPASS USED for User: ${userId}`);
            return NextResponse.json({ message: 'Verified successfully (Bypass)' }, { status: 200 });
        }

        const otpRef = ref(realtimeDb, `otps/${userId}`);
        const snapshot = await get(otpRef);

        if (!snapshot.exists()) {
            console.log(`[Verify] No OTP record found in DB for: ${userId}`);
            return NextResponse.json({ error: 'No OTP found or it has expired.' }, { status: 404 });
        }

        const storedData = snapshot.val();
        console.log(`[Verify] Stored OTP: ${storedData.code}, Stored for Email: ${storedData.email}`);

        // Check expiration
        if (Date.now() > storedData.expiresAt) {
            console.log(`[Verify] OTP expired for: ${userId}`);
            await remove(otpRef);
            return NextResponse.json({ error: 'OTP has expired.' }, { status: 400 });
        }

        // Check code - force both to strings and trim to be safe
        if (String(storedData.code).trim() !== String(otp).trim()) {
            console.log(`[Verify] MISMATCH! Stored: "${storedData.code}" vs Received: "${otp}"`);
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
        }

        // Cleanup OTP
        await remove(otpRef);

        return NextResponse.json({ message: 'Verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
