import { Resend } from 'resend';

/**
 * Email Service using Resend
 * Production-ready email sending for password reset and notifications
 * 
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Get your API key from https://resend.com/api-keys
 * 3. Set RESEND_API_KEY in your .env file
 * 4. For production: Verify your domain at https://resend.com/domains
 */

// Lazy initialization of Resend client
let resend = null;

const getResendClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Unisys InfoTech <onboarding@resend.dev>';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Unisys InfoTech';

/**
 * Check if email service is configured
 * @returns {boolean}
 */
export const isEmailConfigured = () => {
  return !!process.env.RESEND_API_KEY;
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendPasswordResetEmail = async (to, name, resetUrl) => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${COMPANY_NAME}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a3a5c; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 20px; padding: 12px; background-color: #f7fafc; border-radius: 6px; word-break: break-all; font-size: 13px; color: #2563eb;">
                ${resetUrl}
              </p>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                <strong>This link will expire in 1 hour.</strong>
              </p>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                Need help? Contact your administrator.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Reset Your Password - ${COMPANY_NAME}

Hello ${name},

We received a request to reset your password.

Click this link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

- ${COMPANY_NAME} Team
  `;

  try {
    const client = getResendClient();
    if (!client) {
      return { success: false, error: 'Resend client not initialized' };
    }

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Reset Your Password - ${COMPANY_NAME}`,
      html: emailHtml,
      text: textContent,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset email sent successfully:', {
      to,
      messageId: data?.id,
    });
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new user (optional)
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} tempPassword - Temporary password (optional)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendWelcomeEmail = async (to, name, tempPassword = null) => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  const passwordSection = tempPassword 
    ? `<p style="margin: 0 0 20px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; color: #92400e; font-size: 14px;">
        <strong>Your temporary password:</strong> ${tempPassword}<br>
        Please change this after your first login.
       </p>`
    : '';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ${COMPANY_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to ${COMPANY_NAME}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Your account has been created successfully. You can now log in to access your dashboard.
              </p>
              ${passwordSection}
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px;">
                If you have any questions, please contact your administrator.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const client = getResendClient();
    if (!client) {
      return { success: false, error: 'Resend client not initialized' };
    }

    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Welcome to ${COMPANY_NAME}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Welcome email sent successfully:', { to, messageId: data?.id });
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

export default { sendPasswordResetEmail, sendWelcomeEmail, isEmailConfigured };
