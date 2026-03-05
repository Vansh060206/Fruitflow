const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testMail() {
    console.log("Starting email test...");
    console.log("Using User:", process.env.GMAIL_USER);
    // Hide pass for security but check if exists
    console.log("Pass exists:", !!process.env.GMAIL_PASS);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Fruitflow Test" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to self
            subject: "Fruitflow Email Test 🚀",
            text: "If you are reading this, your SMTP configuration is working correctly!",
            html: "<b>If you are reading this, your SMTP configuration is working correctly!</b>"
        });
        console.log("✅ SUCCESS! Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        if (error.code === 'EAUTH') {
            console.error("\nTIP: This looks like an authentication error. Please ensure:");
            console.error("1. You are using a Google 'App Password', NOT your regular Gmail password.");
            console.error("2. 2FA is enabled on your Google account.");
        }
    }
}

testMail();
