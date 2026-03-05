import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
export async function POST(req) {
    try {
        const { email, name, role } = await req.json();
        // Here you would normally save the user to the database
        // For now, we'll just log it and send the email
        console.log(`Registering user: ${email}, Role: ${role}`);
        // Send welcome email
        await sendWelcomeEmail(email, name);
        return NextResponse.json({ success: true, message: "User registered successfully" });
    }
    catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
    }
}
