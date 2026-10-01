import db from '../config/db.js';
import { sendEmailNotification } from '../emails/emailService.js';
import { getEmailTemplate } from '../emails/templates.js';

export async function sendVerificationEmail(req, res) {
  try {
    const user = req.user;
    const token = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO security_tokens (user_id, token, token_type, expires_at)
      VALUES (?, ?, 'EMAIL_VERIFICATION', ?)
    `).run(user.id, token, expiresAt);

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const result = await sendEmailNotification({
      to: user.email,
      emailType: 'EMAIL_VERIFICATION',
      data: { name: user.name, verifyUrl, token }
    });

    return res.json({
      success: true,
      message: 'Verification email sent successfully',
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

    const secToken = db.prepare('SELECT * FROM security_tokens WHERE token = ? AND token_type = ? AND used_at IS NULL').get(token, 'EMAIL_VERIFICATION');
    if (!secToken) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(secToken.user_id);
    db.prepare('UPDATE security_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(secToken.id);

    return res.json({ success: true, message: 'Email address verified successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function triggerCustomEmail(req, res) {
  try {
    const { recipient, emailType } = req.body;
    const targetEmail = recipient || req.user.email;
    const targetType = emailType || 'SUSPICIOUS_LOGIN';

    const result = await sendEmailNotification({
      to: targetEmail,
      emailType: targetType,
      data: {
        name: req.user.name,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent']
      }
    });

    return res.json({
      success: true,
      message: `Triggered email notification [${targetType}] to ${targetEmail}`,
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function previewEmailTemplate(req, res) {
  const { type } = req.params;
  const { html, subject } = getEmailTemplate(type.toUpperCase(), {
    name: 'Mani Kumar',
    email: 'mani.kumar@gmail.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    googleId: '104829302910293840192',
    verifyUrl: 'http://localhost:5173/verify?token=demo',
    resetUrl: 'http://localhost:5173/reset?token=demo'
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}
