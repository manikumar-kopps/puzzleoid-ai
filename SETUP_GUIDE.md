# Complete Production Setup & Deployment Guide

This guide provides step-by-step instructions for configuring **Google Cloud OAuth 2.0 Credentials**, **Gmail Nodemailer Email Transmission**, **Database Initialization**, and **Production Cloud Deployment**.

---

## 1. 🔑 Google Cloud OAuth 2.0 Setup

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top bar and select **"New Project"**.
3. Name your project `Puzzleoid-AI-Auth` and click **Create**.

### Step 2: Configure OAuth Consent Screen
1. In the left navigation menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select **User Type**: **External** (or Internal for Google Workspace) and click **Create**.
3. Fill in App Information:
   - **App Name**: `Puzzleoid AI Auth System`
   - **User Support Email**: Select your email.
   - **Developer Contact Information**: Enter your email.
4. Under **Scopes**, add:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Save and return to dashboard.

### Step 3: Create OAuth 2.0 Client ID Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Select Application type: **Web application**.
4. Set Name: `Puzzleoid AI Web Client`.
5. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:5001`
   - `https://your-production-app.vercel.app`
6. Add **Authorized redirect URIs**:
   - `http://localhost:5001/api/auth/google/callback`
   - `https://your-backend.onrender.com/api/auth/google/callback`
7. Click **Create** and copy your **Client ID** and **Client Secret**.

---

## 2. ✉️ Gmail Nodemailer App Password Setup

To send real HTML emails via Nodemailer:

1. Log into your Google Account and go to **Security Settings** ([myaccount.google.com/security](https://myaccount.google.com/security)).
2. Enable **2-Step Verification** if not already active.
3. Search for **"App passwords"** in the top search bar.
4. Create a new App Password:
   - **App Name**: `Puzzleoid AI Auth`
5. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).
6. Add to your `server/.env` file:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your.email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   EMAIL_FROM="Puzzleoid AI Auth" <auth@puzzleoid.ai>
   ```

---

## 3. 🚀 Running Locally

### Start Backend API:
```bash
cd server
npm install
node index.js
```
The Express backend starts on `http://localhost:5001`.

### Start React Frontend:
```bash
npm run dev
```
The Vite frontend runs on `http://localhost:5173`.

---

## 4. 📦 Production Deployment

### Frontend (Vercel / Netlify):
1. Connect your GitHub repository to Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables: Set `VITE_API_URL=https://your-backend.onrender.com`.

### Backend (Render / Railway / Docker):
1. Deploy `server/` directory to Render Web Service or Railway.
2. Build Command: `npm install`
3. Start Command: `node index.js`
4. Set Environment Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASSWORD`.

---

## 🔒 Security Summary
- **Token Signature**: Server-side ID token signature verification via official `google-auth-library`.
- **Session Tokens**: Transmitted via HTTP-Only, SameSite=Lax, Secure Cookies.
- **Rate Limiting**: Protected against brute force via `express-rate-limit`.
- **Audit Logging**: All logins and email transmissions are recorded in SQL tables.
