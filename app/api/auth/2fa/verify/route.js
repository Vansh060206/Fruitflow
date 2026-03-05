import { NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import { decrypt, encrypt } from '@/lib/encryption';
import crypto from 'crypto';

export async function POST(req) {
    try {
        const { otp, tempSecret } = await req.json();

        if (!otp || !tempSecret) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const secret = decrypt(tempSecret);
        console.log(`[2FA Verify] OTP: ${otp}, Decrypted Secret: ${secret}`);

        const verification = verifySync({ token: otp, secret });
        const isValid = typeof verification === 'object' ? verification.valid : verification;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        // Generate 8 recovery codes
        const recoveryCodes = [];
        for (let i = 0; i < 8; i++) {
            recoveryCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }

        // We return the encrypted secret and recovery codes
        // The frontend will then call the database to save these
        // (In a more centralized backend, we'd save it here directly)
        return NextResponse.json({
            success: true,
            finalSecret: encrypt(secret),
            recoveryCodes
        });
    } catch (error) {
        console.error('2FA Verification failed:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
