const nodemailer = require('nodemailer');
const fs = require('fs');

// Simple manual .env.local reader
function loadEnv() {
    const envPath = '.env.local';
    if (!fs.existsSync(envPath)) {
        console.error("❌ ERROR: .env.local file not found!");
        process.exit(1);
    }
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
        }
    });
}

async function testEmail() {
    loadEnv();
    console.log("Testing SMTP connection with:", process.env.GMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        console.log("Attempting to verify transporter (this tests connection & credentials)...");
        await transporter.verify();
        console.log("✅ Success! Transporter is ready to send emails.");
        
        console.log("Sending a test email...");
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: "Manual SMTP Test Code",
            text: "Diagnostic test success! Your SMTP credentials are correct."
        });
        console.log("✅ Test email sent successfully!");
    } catch (error) {
        console.error("❌ FAILED: Error Details Below:");
        console.error(error);
    }
}

testEmail();
