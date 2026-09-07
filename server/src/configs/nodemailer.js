/**
 * configs/nodemailer.js — Nodemailer Transporter Configuration
 *
 * Exports a configured transporter instance used by email.service.js.
 * Reads SMTP credentials from environment variables.
 *
 * Required .env variables:
 *   EMAIL_HOST     - SMTP host (e.g. smtp.gmail.com)
 *   EMAIL_PORT     - SMTP port (587 for TLS, 465 for SSL)
 *   EMAIL_USER     - SMTP username / Gmail address
 *   EMAIL_PASS     - SMTP password or Gmail App Password
 *   EMAIL_FROM     - "From" address (can be same as EMAIL_USER)
 */

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup (logs success/failure but doesn't crash the server)
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});