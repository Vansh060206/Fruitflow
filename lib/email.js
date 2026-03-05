import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
    // Useful for debugging if mail fails
    debug: true,
    logger: true
});

export const sendVerificationCode = async (email, code) => {
    try {
        console.log(`Email Service: Attempting to send code to ${email}`);
        await transporter.sendMail({
            from: `"Fruitflow Security" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Security Verification Code 🛡️",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #166534;">Security Verification</h2>
                    <p>You requested to verify your identity. Use the code below to complete the login process:</p>
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534;">${code}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please change your password immediately.</p>
                    <br/>
                    <p>The Fruitflow Team</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Error sending verification code:", error);
        return false;
    }
};
export const sendWelcomeEmail = async (email, name) => {
    try {
        const info = await transporter.sendMail({
            from: '"Fruitflow Setup" <noreply@fruitflow.com>',
            to: email,
            subject: "Welcome to the Family! 🍎",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h1 style="color: #2E7D32;">Welcome to Family, ${name}!</h1>
          <p>We are thrilled to have you join our community of over hundreds of members sharing arts and ideas.</p>
          <p>Whether you're picking fresh produce or distributing it to the world, we're here to support your journey.</p>
          <br/>
          <p>Best regards,</p>
          <p>The Fruitflow Team</p>
        </div>
      `,
        });
        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return true;
    }
    catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};
