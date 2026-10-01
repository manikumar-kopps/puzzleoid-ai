import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASSWORD ? {
    user: SMTP_USER,
    pass: SMTP_PASSWORD
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

export async function verifyMailerConnection() {
  if (!SMTP_USER || !SMTP_PASSWORD) {
    console.log('ℹ️ Nodemailer: Operating in simulation mode (Set SMTP_USER & SMTP_PASSWORD in .env for live transmission)');
    return true;
  }
  try {
    await transporter.verify();
    console.log('✅ SMTP Mailer Connected Successfully to', SMTP_HOST);
    return true;
  } catch (err) {
    console.warn('⚠️ SMTP Connection Notice:', err.message);
    return false;
  }
}
