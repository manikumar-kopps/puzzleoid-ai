export function getEmailTemplate(emailType, data = {}) {
  const brandColor = '#8b5cf6';
  const brandName = 'Puzzleoid AI Auth System';
  const year = new Date().getFullYear();

  const wrapTemplate = (title, bodyContent) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .content { padding: 32px 28px; line-height: 1.6; color: #cbd5e1; }
        .content h2 { color: #ffffff; font-size: 18px; margin-top: 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .meta-box { background: #0f172a; border-left: 4px solid #8b5cf6; padding: 14px 18px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #94a3b8; }
        .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 ${brandName}</h1>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>© ${year} ${brandName}. Secured with Google OAuth 2.0 & TLS Encryption.</p>
          <p>This automated email was sent to ${data.email || 'your account'}. Do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  switch (emailType) {
    case 'WELCOME':
      return {
        subject: `Welcome to ${brandName}, ${data.name || 'User'}! 🎉`,
        html: wrapTemplate(
          'Welcome to Puzzleoid AI',
          `
            <h2>Welcome aboard, ${data.name || 'User'}! 👋</h2>
            <p>Your account has been successfully initialized using Google Authentication.</p>
            <p>You now have full access to our AI Photobooth, high-definition Polaroid strips, real-time gesture processing, and cloud gallery storage.</p>
            <div class="meta-box">
              <strong>Account Email:</strong> ${data.email}<br>
              <strong>Auth Provider:</strong> Google OAuth 2.0<br>
              <strong>Google ID:</strong> ${data.googleId || 'Connected'}
            </div>
            <a href="${data.appUrl || 'http://localhost:5173'}" class="btn">Launch Photobooth Studio</a>
          `
        )
      };

    case 'ACCOUNT_CREATED':
      return {
        subject: `New Account Created - ${brandName}`,
        html: wrapTemplate(
          'Account Created Confirmation',
          `
            <h2>New Account Confirmed ✨</h2>
            <p>Hello ${data.name || 'User'}, a new account associated with <strong>${data.email}</strong> was registered via Google OAuth 2.0.</p>
            <div class="meta-box">
              <strong>Time:</strong> ${new Date().toUTCString()}<br>
              <strong>IP Address:</strong> ${data.ipAddress || '127.0.0.1'}<br>
              <strong>Device / Browser:</strong> ${data.userAgent || 'Web Browser'}
            </div>
            <p>If you did not initiate this account creation, please secure your Google account immediately.</p>
          `
        )
      };

    case 'LOGIN_ALERT':
      return {
        subject: `Security Alert: New Sign-in to Your Account`,
        html: wrapTemplate(
          'Login Alert',
          `
            <h2>New Login Detected 🔐</h2>
            <p>Hello ${data.name || 'User'}, your account was just accessed using Google OAuth 2.0.</p>
            <div class="meta-box">
              <strong>Account:</strong> ${data.email}<br>
              <strong>Date & Time:</strong> ${new Date().toUTCString()}<br>
              <strong>IP Address:</strong> ${data.ipAddress || '127.0.0.1'}<br>
              <strong>Browser:</strong> ${data.userAgent || 'Web Browser'}
            </div>
            <p>If this was you, no action is needed.</p>
          `
        )
      };

    case 'SUSPICIOUS_LOGIN':
      return {
        subject: `⚠️ URGENT: Suspicious Login Detected on Your Account`,
        html: wrapTemplate(
          'Suspicious Login Warning',
          `
            <h2 style="color: #ef4444;">⚠️ Suspicious Activity Warning</h2>
            <p>We detected an unrecognized login attempt to your account from an unusual location or device.</p>
            <div class="meta-box" style="border-left-color: #ef4444; background: #2d1215; color: #fca5a5;">
              <strong>Time:</strong> ${new Date().toUTCString()}<br>
              <strong>Unrecognized IP:</strong> ${data.ipAddress || 'Unknown IP'}<br>
              <strong>User Agent:</strong> ${data.userAgent || 'Unknown Device'}
            </div>
            <p>We recommend revoking active sessions from your profile settings page immediately.</p>
          `
        )
      };

    case 'EMAIL_VERIFICATION':
      return {
        subject: `Verify Your Email Address - ${brandName}`,
        html: wrapTemplate(
          'Email Verification',
          `
            <h2>Verify Your Email ✉️</h2>
            <p>Please click the button below to verify your primary email address <strong>${data.email}</strong>.</p>
            <a href="${data.verifyUrl || '#'}" class="btn">Verify Email Address</a>
            <div class="meta-box">
              This link will expire in 24 hours. Token: <code>${data.token || 'VERIFY_TOKEN'}</code>
            </div>
          `
        )
      };

    case 'PASSWORD_CHANGED':
      return {
        subject: `Security Alert: Password Changed`,
        html: wrapTemplate(
          'Password Changed Confirmation',
          `
            <h2>Password Updated 🔑</h2>
            <p>The password for account <strong>${data.email}</strong> was recently changed.</p>
            <div class="meta-box">
              <strong>Timestamp:</strong> ${new Date().toUTCString()}
            </div>
            <p>If you made this change, you can safely ignore this email.</p>
          `
        )
      };

    case 'EMAIL_CHANGED':
      return {
        subject: `Notice: Primary Email Address Changed`,
        html: wrapTemplate(
          'Email Address Changed',
          `
            <h2>Primary Email Updated 🔄</h2>
            <p>Your primary account email address has been updated to <strong>${data.newEmail}</strong>.</p>
            <div class="meta-box">
              <strong>Previous Email:</strong> ${data.email}
            </div>
          `
        )
      };

    case 'FORGOT_PASSWORD':
      return {
        subject: `Password Reset Request - ${brandName}`,
        html: wrapTemplate(
          'Password Reset Link',
          `
            <h2>Reset Your Password 🔐</h2>
            <p>You requested a password reset for <strong>${data.email}</strong>.</p>
            <a href="${data.resetUrl || '#'}" class="btn">Reset Password</a>
            <div class="meta-box">
              Link valid for 1 hour. Token: <code>${data.token || 'RESET_TOKEN'}</code>
            </div>
          `
        )
      };

    case 'RESET_PASSWORD_CONFIRM':
      return {
        subject: `Your Password Has Been Reset`,
        html: wrapTemplate(
          'Password Reset Successful',
          `
            <h2>Password Reset Confirmed ✅</h2>
            <p>Your password for <strong>${data.email}</strong> was successfully updated.</p>
          `
        )
      };

    case 'SESSION_REVOKED':
      return {
        subject: `Security Notice: Active Session Revoked`,
        html: wrapTemplate(
          'Session Revoked',
          `
            <h2>Session Terminated 🛡️</h2>
            <p>An active session for account <strong>${data.email}</strong> was manually terminated.</p>
            <div class="meta-box">
              <strong>Revoked IP:</strong> ${data.ipAddress || 'Session'}
            </div>
          `
        )
      };

    case 'ACCOUNT_DELETED':
      return {
        subject: `Account Deletion Confirmation - ${brandName}`,
        html: wrapTemplate(
          'Account Deleted',
          `
            <h2>Account Deleted 🗑️</h2>
            <p>As requested, your account and associated profile data for <strong>${data.email}</strong> have been permanently deleted from our servers.</p>
            <p>We are sorry to see you go! You can sign back in with Google anytime to start a fresh account.</p>
          `
        )
      };

    default:
      return {
        subject: `Notification from ${brandName}`,
        html: wrapTemplate(
          'Account Notification',
          `<p>Hello ${data.name || 'User'}, you have a new security notification for <strong>${data.email}</strong>.</p>`
        )
      };
  }
}
