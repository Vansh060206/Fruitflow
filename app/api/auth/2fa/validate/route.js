import { verifySync } from 'otplib';
import { decrypt } from '@/lib/encryption';
import { ref, get, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { otp, encryptedSecret, recoveryCodes, isRecovery, isEmailCode, uid } = await req.json();

        if (isEmailCode) {
            if (!uid || !otp) {
                return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
            }
            const verificationRef = ref(realtimeDb, `otps/${uid}`);
            const snapshot = await get(verificationRef);
            if (!snapshot.exists()) {
                return NextResponse.json({ error: 'Verification code not found (expired or incorrect user)' }, { status: 400 });
            }
            const data = snapshot.val();
            if (data.expiresAt < Date.now()) {
                await remove(verificationRef);
                return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
            }
            if (data.code !== otp) {
                return NextResponse.json({ error: 'Incorrect verification code' }, { status: 400 });
            }
            // Code is valid
            await remove(verificationRef);
            return NextResponse.json({ success: true });
        }

        if (!otp || !encryptedSecret) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (isRecovery) {
            // Check recovery codes
            const index = recoveryCodes.indexOf(otp.toUpperCase());
            if (index > -1) {
                // Return success and index to remove the code
                return NextResponse.json({ success: true, usedRecoveryIndex: index });
            }
            return NextResponse.json({ error: 'Invalid recovery code' }, { status: 400 });
        }

        const secret = decrypt(encryptedSecret);
        const verification = verifySync({ token: otp, secret });
        const isValid = typeof verification === 'object' ? verification.valid : verification;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('2FA Validation failed:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
