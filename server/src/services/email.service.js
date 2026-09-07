/**
 * services/email.service.js — Email Delivery Service
 *
 * All outbound emails go through this service.
 * Uses Nodemailer with the SMTP config from configs/nodemailer.js.
 *
 * EMAIL TYPES:
 * 1. sendCredentials  → Owner creates staff → sends login email with temp password
 * 2. sendVerification → Owner signs up → sends email verification link
 * 3. sendPasswordReset→ Future: password reset flow
 */

import { transporter } from "../configs/nodemailer.js";

const PLATFORM_NAME = "SkyLine Manager Pro";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * sendCredentials — Email login credentials to a newly created staff member.
 *
 * Called when an owner adds a manager, employee, or tenant.
 * The email includes:
 * - Their assigned email
 * - Their temporary password
 * - The login URL
 * - Instructions to change their password after first login
 *
 * @param {object} params
 * @param {string} params.toEmail   - Staff member's email address
 * @param {string} params.toName    - Staff member's full name
 * @param {string} params.tempPassword - Plain-text temp password (NOT stored, sent once)
 * @param {string} params.role      - 'manager' | 'employee' | 'tenant'
 * @param {string} params.ownerName - Building owner's name (for context)
 * @param {string} params.buildingName - Building they're assigned to
 */
export const sendCredentials = async ({
  toEmail,
  toName,
  tempPassword,
  role,
  ownerName,
  buildingName,
}) => {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const loginUrl = `${FRONTEND_URL}/login`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .header p { color: #bfdbfe; margin: 8px 0 0; }
        .body { padding: 32px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
        .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-box h3 { color: #0369a1; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .credential-row { display: flex; margin-bottom: 12px; }
        .credential-label { color: #64748b; font-size: 14px; width: 120px; flex-shrink: 0; }
        .credential-value { color: #0f172a; font-size: 14px; font-weight: 600; font-family: monospace; }
        .login-btn { display: block; text-align: center; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .warning { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #713f12; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 ${PLATFORM_NAME}</h1>
          <p>Building Management Platform</p>
        </div>
        <div class="body">
          <p class="greeting">Hello, ${toName}!</p>
          <p style="color: #475569; line-height: 1.6;">
            <strong>${ownerName}</strong> has added you as a <strong>${roleLabel}</strong>
            ${buildingName ? `for <strong>${buildingName}</strong>` : ""}
            on ${PLATFORM_NAME}. Your account is ready.
          </p>
          
          <div class="info-box">
            <h3>🔐 Your Login Credentials</h3>
            <div class="credential-row">
              <span class="credential-label">Email:</span>
              <span class="credential-value">${toEmail}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Password:</span>
              <span class="credential-value">${tempPassword}</span>
            </div>
            <div class="credential-row">
              <span class="credential-label">Role:</span>
              <span class="credential-value">${roleLabel}</span>
            </div>
          </div>

          <a href="${loginUrl}" class="login-btn">Login to Your Dashboard →</a>

          <div class="warning">
            ⚠️ <strong>Important:</strong> This is a temporary password. You will be asked to change it after your first login. Keep this email secure.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${PLATFORM_NAME}. This email was sent on behalf of ${ownerName}.</p>
          <p>If you did not expect this email, please ignore it or contact your building management.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${PLATFORM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: `Your ${PLATFORM_NAME} Account — Login Credentials`,
    html: htmlBody,
    text: `Hello ${toName},\n\nYou have been added to ${PLATFORM_NAME} as a ${roleLabel}.\n\nEmail: ${toEmail}\nPassword: ${tempPassword}\nLogin: ${loginUrl}\n\nPlease change your password after logging in.\n\n${PLATFORM_NAME}`,
  });
};

/**
 * sendEmailVerification — Send a verification link to a new owner.
 *
 * @param {object} params
 * @param {string} params.toEmail - Owner's email
 * @param {string} params.toName - Owner's name
 * @param {string} params.token - Signed JWT verification token
 */
export const sendEmailVerification = async ({ toEmail, toName, token }) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; }
        .verify-btn { display: block; text-align: center; background: #10b981; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🏢 ${PLATFORM_NAME}</h1></div>
        <div class="body">
          <p style="font-size:18px; color:#1e293b;">Hello, ${toName}!</p>
          <p style="color:#475569; line-height:1.6;">
            Thank you for registering on ${PLATFORM_NAME}. Please verify your email address to activate your account.
          </p>
          <a href="${verificationUrl}" class="verify-btn">✅ Verify Email Address</a>
          <p style="font-size:13px; color:#94a3b8;">This link expires in 1 hour. If you didn't register, please ignore this email.</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} ${PLATFORM_NAME}</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${PLATFORM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: `Verify Your ${PLATFORM_NAME} Email`,
    html: htmlBody,
    text: `Hello ${toName},\n\nVerify your email: ${verificationUrl}\n\nThis link expires in 1 hour.`,
  });
};
