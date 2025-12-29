class EmailService {
    constructor() {
        if (process.env.BREVO_API_KEY) {
            const key = process.env.BREVO_API_KEY;
            console.log(`✅ Brevo Email Service initialized (Key starts with: ${key.substring(0, 5)}...)`);
        } else {
            console.log('⚠️ BREVO_API_KEY not set. Email service will log to console.');
        }
    }

    async sendVerificationEmail(user, token) {
        console.log(`📧 Attempting to send verification email to: ${user.email}`);
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        if (!process.env.BREVO_API_KEY) {
            console.log('⚠️ BREVO_API_KEY not set. Email service will log to console.');
            console.log('Verification URL:', verificationUrl);
            return;
        }

        if (!process.env.SENDER_EMAIL) {
            console.error('❌ SENDER_EMAIL is not set in environment variables. Brevo requires a verified sender email.');
            return;
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'x-sib-api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: process.env.FROM_NAME || 'AI PPT Generator',
                        email: process.env.SENDER_EMAIL // This must be your verified email in Brevo
                    },
                    to: [{ email: user.email }],
                    subject: 'Verify your email address',
                    htmlContent: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                            <h2 style="color: #333;">Welcome to AI PPT Generator!</h2>
                            <p>Please click the button below to verify your email address and activate your account:</p>
                            <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                            <p style="color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
                        </div>
                    `
                })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ Brevo Error:', result);
            } else {
                console.log('📧 Verification email sent successfully via Brevo');
            }
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
        }
    }

    async sendResetPasswordEmail(user, token) {
        console.log(`📧 Attempting to send reset password email to: ${user.email}`);
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        if (!process.env.BREVO_API_KEY) {
            console.log('⚠️ BREVO_API_KEY not set. Email service will log to console.');
            console.log('Reset URL:', resetUrl);
            return;
        }

        if (!process.env.SENDER_EMAIL) {
            console.error('❌ SENDER_EMAIL is not set in environment variables.');
            return;
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'x-sib-api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: process.env.FROM_NAME || 'AI PPT Generator',
                        email: process.env.SENDER_EMAIL
                    },
                    to: [{ email: user.email }],
                    subject: 'Password Reset Request',
                    htmlContent: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                            <h2 style="color: #333;">Password Reset Request</h2>
                            <p>You requested a password reset. Please click the button below to set a new password:</p>
                            <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                            <p>This link will expire in 10 minutes.</p>
                            <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `
                })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ Brevo Error:', result);
            } else {
                console.log('📧 Reset password email sent successfully via Brevo');
            }
        } catch (error) {
            console.error('❌ Error sending reset password email:', error.message);
        }
    }
}

module.exports = new EmailService();
