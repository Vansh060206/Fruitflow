import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, name, status } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER?.trim(),
                pass: process.env.GMAIL_PASS?.trim(),
            },
        });

        const isEnabled = status === 'enabled';

        const mailOptions = {
            from: `"Fruitflow" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Security Alert: 2FA ${isEnabled ? 'Enabled' : 'Disabled'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h1 style="color: ${isEnabled ? '#059669' : '#dc2626'};">Security Update</h1>
                    <p style="font-size: 16px; color: #374151;">Hello ${name || 'User'},</p>
                    <p style="font-size: 16px; color: #374151;">
                        Two-Factor Authentication (2FA) has been <strong>${status}</strong> on your Fruitflow account.
                    </p>
                    ${isEnabled ? `
                        <p style="font-size: 14px; color: #4b5563;">
                            Your account is now more secure. You will be required to enter a 6-digit code after your password during login.
                        </p>
                    ` : `
                        <p style="font-size: 14px; color: #b91c1c;">
                            <strong>Warning:</strong> Your account is now less secure. If you did not perform this action, please reset your password immediately.
                        </p>
                    `}
                    <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Secure your account by never sharing your 2FA secret or recovery codes.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending 2FA status email:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
