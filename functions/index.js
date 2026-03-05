const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure the email transport using Gmail
// In a real app, you'd set these using:
// firebase functions:config:set gmail.email="my@gmail.com" gmail.password="app-password"
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// Cloud Function triggered when a new user is created in RTDB
exports.sendWelcomeEmail = functions.database.ref("/users/{uid}")
    .onCreate(async (snapshot, context) => {
        const userData = snapshot.val();
        const email = userData.email;
        const displayName = userData.name || "User";

        console.log("New user detected, sending welcome email to:", email);

        const mailOptions = {
            from: `"Fruitflow" <${gmailEmail}>`,
            to: email,
            subject: "Welcome to Fruitflow!",
            html: `
                <h1>Welcome, ${displayName}!</h1>
                <p>Thank you for joining Fruitflow. We are excited to have you on board.</p>
                <p>You have registered as a <strong>${userData.role || 'retailer'}</strong>.</p>
                <p>Start exploring our platform now!</p>
                <br>
                <p>Best regards,</p>
                <p>The Fruitflow Team</p>
            `,
        };

        try {
            await mailTransport.sendMail(mailOptions);
            console.log("Welcome email sent successfully to:", email);
        } catch (error) {
            console.error("Error sending welcome email:", error);
        }
    });
