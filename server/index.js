import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import { verifyMailerConnection } from './config/mailer.js';
import { googleLogin, logout, getSession } from './controllers/authController.js';
import { getProfile, updateProfile, deleteAccount, revokeSession } from './controllers/userController.js';
import { sendVerificationEmail, verifyEmail, triggerCustomEmail, previewEmailTemplate } from './controllers/emailController.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { authRateLimiter, emailRateLimiter } from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Initialize Database Schema
initDB();
verifyMailerConnection();

// 2. HTTP Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    'http://localhost:5181'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 3. Health & Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Google OAuth 2.0 & User Registration Engine',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// 4. Authentication & Registration Endpoints
app.post('/api/auth/google', authRateLimiter, googleLogin);
app.post('/api/auth/register-google', authRateLimiter, googleLogin); // Dedicated registration endpoint
app.post('/api/auth/logout', logout);
app.get('/api/auth/session', authenticateToken, getSession);

// 5. User Profile & Account Management Endpoints
app.get('/api/user/profile', authenticateToken, getProfile);
app.put('/api/user/profile', authenticateToken, updateProfile);
app.delete('/api/user/account', authenticateToken, deleteAccount);
app.delete('/api/user/session/:id', authenticateToken, revokeSession);

// 6. Email Notification & Verification Endpoints
app.post('/api/email/verify-email', authenticateToken, emailRateLimiter, sendVerificationEmail);
app.post('/api/email/verify', verifyEmail);
app.post('/api/email/trigger', authenticateToken, emailRateLimiter, triggerCustomEmail);
app.get('/api/email/preview/:type', previewEmailTemplate);

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Production Backend API running on http://localhost:${PORT}`);
});
