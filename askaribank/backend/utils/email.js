const nodemailer = require('nodemailer');

/**
 * Creates a Gmail transporter using credentials from .env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
    },
  });
};

/**
 * Sends a password reset email with a styled HTML template
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - Recipient's display name
 * @param {string} resetLink - The password reset URL
 */
const sendResetEmail = async (toEmail, userName, resetLink) => {
  const transporter = createTransporter();

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AskariBank - Password Reset</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:520px;background:#ffffff;border-radius:32px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);padding:40px 40px 30px;text-align:center;">
                  <table width="56" height="56" style="margin:0 auto 16px;background:rgba(255,255,255,0.1);border-radius:16px;border:1px solid rgba(255,255,255,0.15);" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" valign="middle">
                        <span style="font-size:26px;">🔐</span>
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">AskariBank</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Premium Banking Portal</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="margin:0 0 12px;color:#0F172A;font-size:22px;font-weight:900;">Password Reset Request</h2>
                  <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.7;">
                    Hi <strong style="color:#0F172A;">${userName}</strong>,<br><br>
                    We received a request to reset your AskariBank account password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:8px 0 28px;">
                        <a href="${resetLink}"
                          style="display:inline-block;background:linear-gradient(135deg,#0F172A,#1e40af);color:#ffffff;text-decoration:none;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:18px 40px;border-radius:50px;box-shadow:0 8px 24px rgba(15,23,42,0.25);">
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Security note -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 8px;color:#0F172A;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;">🛡️ Security Notice</p>
                        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                          If you did not request this reset, please ignore this email — your account remains secure. Never share this link with anyone.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Fallback link -->
                  <p style="margin:24px 0 0;color:#94a3b8;font-size:11px;text-align:center;line-height:1.6;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${resetLink}" style="color:#3b82f6;word-break:break-all;">${resetLink}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                    © ${new Date().getFullYear()} AskariBank · Secure Banking Portal
                  </p>
                  <p style="margin:8px 0 0;color:#cbd5e1;font-size:10px;">
                    This is an automated message. Please do not reply to this email.
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `AskariBank <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 AskariBank — Password Reset Request',
    html: htmlBody,
  });
};

module.exports = { sendResetEmail };
