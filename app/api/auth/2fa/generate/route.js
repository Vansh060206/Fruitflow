import { NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { encrypt } from '@/lib/encryption';

export async function POST(req) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate secret
        const secret = generateSecret();

        // Generate OTP Auth URL
        const otpauth = generateURI({
            secret,
            issuer: 'Fruitflow',
            label: email
        });

        // Generate QR Code
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Encrypt secret for temporary response or session mapping if needed
        // But here we return it so the frontend can verify the first OTP before we save it officially
        const encryptedSecret = encrypt(secret);

        return NextResponse.json({
            qrCodeUrl,
            secret, // We show the manual key
            tempSecret: encryptedSecret
        });
    } catch (error) {
        console.error('2FA Generation failed:', error);
        return NextResponse.json({ error: 'Failed to generate 2FA' }, { status: 500 });
    }
}
