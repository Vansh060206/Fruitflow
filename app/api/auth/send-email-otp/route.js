import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ref, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

export async function POST(req) {
    try {
        const { email, userId, name } = await req.json();

        if (!email || !userId) {
            return NextResponse.json({ error: 'Email and User ID are required' }, { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        console.log(`[OTP] Generated: ${otp} for User: ${userId} (${email})`);

        // Save OTP to Realtime Database
        await set(ref(realtimeDb, `otps/${userId}`), {
            code: otp,
            expiresAt,
            email
        });

        // Send Email
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER?.trim(),
                pass: process.env.GMAIL_PASS?.trim(),
            },
        });

        const mailOptions = {
            from: `"Fruitflow Security" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `${otp} is your Fruitflow verification code`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #059669; margin: 0; font-size: 28px;">Fruitflow</h1>
                        <p style="color: #6b7280; font-size: 14px;">Verify your email address</p>
                    </div>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi ${name || 'there'},</p>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">To complete your registration and secure your account, please use the following verification code:</p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <span style="font-family: monospace; font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #059669; background: #ecfdf5; padding: 15px 30px; border-radius: 12px; border: 1px dashed #10b981;">
                            ${otp}
                        </span>
                    </div>

                    <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-bottom: 30px;">
                        This code will expire in 10 minutes.
                    </p>

                    <div style="border-top: 1px solid #f3f4f6; pt-30px; margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                        <p>&copy; 2026 Fruitflow Technologies</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({
            error: 'Failed to send OTP',
            details: error.message
        }, { status: 500 });
    }
}
