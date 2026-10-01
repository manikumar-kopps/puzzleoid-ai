import { transporter } from '../config/mailer.js';
import { getEmailTemplate } from './templates.js';
import db from '../config/db.js';

export async function sendEmailNotification({ to, emailType, data = {} }) {
  const { subject, html } = getEmailTemplate(emailType, { ...data, email: to });
  const from = process.env.EMAIL_FROM || '"Puzzleoid AI Auth" <auth@puzzleoid.ai>';

  let status = 'SENT';
  let messageId = null;
  let errorMessage = null;

  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      messageId = info.messageId;
      console.log(`✉️ Email [${emailType}] sent to ${to}: ${messageId}`);
    } else {
      // Simulate real email dispatch & log to DB when SMTP creds are pending
      messageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      console.log(`✉️ [SMTP Simulation] Email [${emailType}] dispatched to ${to}`);
    }
  } catch (err) {
    status = 'FAILED';
    errorMessage = err.message;
    console.error(`❌ Email delivery failed [${emailType}] to ${to}:`, err.message);
  }

  // Record audit entry in email_logs table
  try {
    const stmt = db.prepare(`
      INSERT INTO email_logs (recipient, subject, email_type, status, message_id, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(to, subject, emailType, status, messageId, errorMessage);
  } catch (dbErr) {
    console.error('Failed to log email in DB:', dbErr.message);
  }

  return { status, messageId, errorMessage, subject, html };
}
