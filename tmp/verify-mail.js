const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(__dirname, '../.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
    return env;
}

const env = getEnv();

async function testMail() {
    console.log("Starting email verification test...");
    console.log("User:", env.GMAIL_USER);

    if (!env.GMAIL_USER || !env.GMAIL_PASS) {
        console.error("Missing GMAIL_USER or GMAIL_PASS in .env.local");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: env.GMAIL_USER,
            pass: env.GMAIL_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        console.log("Sending test mail to self...");
        const info = await transporter.sendMail({
            from: `"Fruitflow Test" <${env.GMAIL_USER}>`,
            to: env.GMAIL_USER,
            subject: "2FA Email Configuration Verified ✅",
            html: "<b>Great news! Your 2FA email system is now working correctly.</b>"
        });
        console.log("✅ VERIFIED SUCCESS! Message sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ STILL FAILING!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        if (error.code === 'EAUTH') {
            console.error("\nTIP: Still getting auth issues. Ensure there are no spaces in the App Password.");
        }
    }
}

testMail();
