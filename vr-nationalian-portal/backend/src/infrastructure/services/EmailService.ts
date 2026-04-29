import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: Date; attempts: number }>();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL || 'teamjarvis.technologies@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'rtwdekpmwrwgistm'
  }
});

export class EmailService {
  static async sendPasswordResetCode(email: string, userName: string): Promise<{ message: string }> {
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    
    // Store code with 10-minute expiration and attempt tracking
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    verificationCodes.set(`reset_${email}`, { code, expiresAt, attempts: 0 });

    // Log code to console for development
    console.log('=' .repeat(60));
    console.log(`🔐 PASSWORD RESET CODE GENERATED`);
    console.log(`Email: ${email}`);
    console.log(`Code: ${code}`);
    console.log(`Expires: ${expiresAt.toLocaleTimeString()}`);
    console.log('='.repeat(60));

    // Send email
    try {
      await transporter.sendMail({
        from: `"VR Nationalian Security" <${process.env.GMAIL_EMAIL || 'teamjarvis.technologies@gmail.com'}>`,
        to: email,
        subject: 'Password Reset Request - VR Nationalian',
        text: `Dear ${userName},

We received a request to reset your password for the VR Nationalian Portal.

To reset your password, please use the following code:

RESET CODE: ${code}

This reset code will expire in 10 minutes for security purposes.

If you did not request a password reset, please ignore this email and your password will remain unchanged.

For security concerns, please contact the VR Nationalian support team immediately.

Best regards,
VR Nationalian Team
National University

---
This is an automated message. Please do not reply to this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Password Reset Request</h2>
            <p>Dear ${userName},</p>
            <p>We received a request to reset your password for the VR Nationalian Portal.</p>
            <p>To reset your password, please use the following code:</p>
            <div style="background-color: #dbeafe; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #3b82f6;">
              <h1 style="color: #3b82f6; margin: 0; font-size: 32px; letter-spacing: 8px;">${code}</h1>
            </div>
            <p style="color: #3b82f6; font-weight: bold;">⏰ This reset code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p style="color: #3b82f6; font-size: 14px; font-weight: bold;">⚠️ For security concerns, please contact the VR Nationalian support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Best regards,<br>
              VR Nationalian Team<br>
              National University
            </p>
            <p style="color: #9ca3af; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      });

      console.log(`✅ Password reset email sent successfully to ${email}`);
      return {
        message: 'Password reset code sent successfully'
      };
    } catch (error) {
      console.error('❌ Email sending error:', error);
      // Remove verification code if email fails
      verificationCodes.delete(`reset_${email}`);
      throw new Error('FAILED_TO_SEND_EMAIL');
    }
  }

  static verifyPasswordResetCode(email: string, code: string): { valid: boolean } {
    const storedData = verificationCodes.get(`reset_${email}`);
    
    if (!storedData) {
      return { valid: false };
    }

    // Check if code expired
    if (new Date() > storedData.expiresAt) {
      verificationCodes.delete(`reset_${email}`);
      return { valid: false };
    }

    // Check attempt limit (3 attempts)
    if (storedData.attempts >= 3) {
      verificationCodes.delete(`reset_${email}`);
      return { valid: false };
    }

    // Check if code matches
    if (storedData.code !== code) {
      // Increment attempts
      storedData.attempts += 1;
      verificationCodes.set(`reset_${email}`, storedData);
      return { valid: false };
    }

    // Code is valid
    return { valid: true };
  }

  static clearPasswordResetCode(email: string): void {
    verificationCodes.delete(`reset_${email}`);
  }
}
