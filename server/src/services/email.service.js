const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true' || false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        // Verify connection on startup
        if (process.env.SMTP_EMAIL) {
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ SMTP Connection Error:', error.message);
                } else {
                    console.log('✅ SMTP Server is ready to take our messages');
                }
            });
        }
    }

    async sendVerificationEmail(user, token) {
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        const message = {
            from: `"${process.env.FROM_NAME || 'AI PPT Generator'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
            to: user.email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Welcome to AI PPT Generator!</h2>
                    <p>Please click the button below to verify your email address and activate your account:</p>
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                    <p style="color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `
        };

        try {
            if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
                console.log('⚠️ SMTP credentials not fully set. Skipping email sending.');
                console.log('Verification URL:', verificationUrl);
                return;
            }
            const info = await this.transporter.sendMail(message);
            console.log('📧 Verification email sent successfully:', info.messageId);
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
            console.error('Full error details:', error);
            // We don't throw here to prevent breaking the registration flow
        }
    }
}

module.exports = new EmailService();
