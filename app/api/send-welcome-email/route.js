import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, name, role } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.GMAIL_USER?.trim(),
                pass: process.env.GMAIL_PASS?.trim(),
            },
        });

        const mailOptions = {
            from: `"Fruitflow" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Fruitflow!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h1 style="color: #059669;">Welcome to Fruitflow, ${name || 'User'}!</h1>
                    <p style="font-size: 16px; color: #374151;">Thank you for joining our platform. We are excited to have you on board.</p>
                    <p style="font-size: 16px; color: #374151;">You have registered as a <strong>${role || 'user'}</strong>.</p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">If you didn't create this account, please ignore this email.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', email);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error sending email. Detailed error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({
            error: 'Failed to send email',
            details: error.message
        }, { status: 500 });
    }
}
