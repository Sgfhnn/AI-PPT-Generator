const { Resend } = require('resend');

class EmailService {
    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new Resend(process.env.RESEND_API_KEY);
            console.log('✅ Resend Email Service initialized');
        } else {
            console.log('⚠️ RESEND_API_KEY not set. Email service will log to console.');
        }
    }

    async sendVerificationEmail(user, token) {
        const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        if (!this.resend) {
            console.log('📧 [MOCK EMAIL] To:', user.email);
            console.log('Verification URL:', verificationUrl);
            return;
        }

        try {
            const { data, error } = await this.resend.emails.send({
                from: `${process.env.FROM_NAME || 'AI PPT Generator'} <onboarding@resend.dev>`,
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
            });

            if (error) {
                console.error('❌ Resend Error:', error);
            } else {
                console.log('📧 Verification email sent successfully:', data?.id);
            }
        } catch (error) {
            console.error('❌ Error sending verification email:', error.message);
        }
    }
}

module.exports = new EmailService();
