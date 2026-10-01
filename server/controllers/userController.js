import db from '../config/db.js';
import { sendEmailNotification } from '../emails/emailService.js';

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    const loginHistory = db.prepare('SELECT * FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(userId);
    const activeSessions = db.prepare('SELECT id, ip_address, user_agent, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const emailLogs = db.prepare('SELECT recipient, subject, email_type, status, sent_at FROM email_logs WHERE recipient = ? ORDER BY sent_at DESC LIMIT 10').all(user.email);

    return res.json({
      success: true,
      user: {
        id: user.id,
        googleId: user.google_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        verified: Boolean(user.verified),
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at
      },
      loginHistory,
      activeSessions,
      emailLogs
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, avatar, email } = req.body;
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    let updatedEmail = currentUser.email;
    let emailChanged = false;

    if (email && email !== currentUser.email) {
      // Check duplicate
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email address already in use by another account' });
      }
      updatedEmail = email;
      emailChanged = true;
    }

    db.prepare(`
      UPDATE users
      SET name = ?, avatar = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || currentUser.name, avatar || currentUser.avatar, updatedEmail, userId);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (emailChanged) {
      sendEmailNotification({
        to: updatedEmail,
        emailType: 'EMAIL_CHANGED',
        data: { name: updatedUser.name, email: currentUser.email, newEmail: updatedEmail }
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.clearCookie('auth_token');

    sendEmailNotification({
      to: email,
      emailType: 'ACCOUNT_DELETED',
      data: { email }
    });

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function revokeSession(req, res) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, userId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);

    sendEmailNotification({
      to: req.user.email,
      emailType: 'SESSION_REVOKED',
      data: { ipAddress: session.ip_address }
    });

    return res.json({ success: true, message: 'Session revoked successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
