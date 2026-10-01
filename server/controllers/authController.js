import db from '../config/db.js';
import { verifyGoogleToken } from '../config/google.js';
import { generateToken } from '../middlewares/authMiddleware.js';
import { sendEmailNotification } from '../emails/emailService.js';

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google ID Token credential is required'
      });
    }

    // 1. Server-side verification of Google ID Token (Never trust frontend profile info)
    const verifiedGoogleUser = await verifyGoogleToken(credential);

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    // 2. Primary Account Lookup using immutable Google Account ID (`sub`)
    // Rule: Identify user by account ID (google_id), NOT email address alone.
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(verifiedGoogleUser.googleId);

    // Fallback: Check by email to link existing local account if google_id is not set
    if (!user && verifiedGoogleUser.email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(verifiedGoogleUser.email);
      if (user) {
        // Link Google ID to existing account
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(verifiedGoogleUser.googleId, user.id);
        user.google_id = verifiedGoogleUser.googleId;
      }
    }

    let isNewAccount = false;

    if (!user) {
      // 3. Create new user account automatically if user does not exist
      isNewAccount = true;
      const stmt = db.prepare(`
        INSERT INTO users (google_id, email, name, avatar, provider, verified, role)
        VALUES (?, ?, ?, ?, 'google', 1, 'user')
      `);
      const info = stmt.run(
        verifiedGoogleUser.googleId,
        verifiedGoogleUser.email,
        verifiedGoogleUser.name,
        verifiedGoogleUser.picture
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);

      // Record authentication record
      db.prepare(`
        INSERT INTO authentications (user_id, provider, provider_user_id)
        VALUES (?, 'google', ?)
      `).run(user.id, verifiedGoogleUser.googleId);

      // Dispatch Welcome & Account Created HTML Emails
      sendEmailNotification({
        to: user.email,
        emailType: 'WELCOME',
        data: { name: user.name, googleId: user.google_id }
      });

      sendEmailNotification({
        to: user.email,
        emailType: 'ACCOUNT_CREATED',
        data: { name: user.name, ipAddress, userAgent }
      });
    } else {
      // 4. Existing user: Update name, avatar, and last login timestamp
      db.prepare(`
        UPDATE users
        SET name = ?, avatar = ?, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(verifiedGoogleUser.name, verifiedGoogleUser.picture || user.avatar, user.id);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

      // Dispatch Login Alert HTML Email
      sendEmailNotification({
        to: user.email,
        emailType: 'LOGIN_ALERT',
        data: { name: user.name, ipAddress, userAgent }
      });
    }

    // 5. Record Login History Audit Log
    db.prepare(`
      INSERT INTO login_history (user_id, ip_address, user_agent, status)
      VALUES (?, ?, ?, 'SUCCESS')
    `).run(user.id, ipAddress, userAgent);

    // 6. Generate Session Token & Set HTTP-Only Secure Cookie
    const token = generateToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, token, ipAddress, userAgent, expiresAt);

    // Set HTTP-Only Cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      isNewAccount,
      message: isNewAccount ? 'Account created via Google OAuth 2.0' : 'Logged in successfully',
      token,
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
      }
    });
  } catch (error) {
    console.error('Google OAuth Authentication Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Google authentication failed'
    });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies.auth_token || req.headers['authorization']?.split(' ')[1];
    if (token) {
      db.prepare('DELETE FROM sessions WHERE session_token = ?').run(token);
    }
    res.clearCookie('auth_token');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSession(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}
