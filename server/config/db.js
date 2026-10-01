import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, '../database.json');

let store = {
  users: [
    {
      id: 1,
      google_id: '104829302910293840192',
      email: 'mani.kumar@gmail.com',
      name: 'Mani Kumar',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
      verified: 1,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    }
  ],
  authentications: [],
  sessions: [],
  login_history: [],
  email_logs: [],
  security_tokens: []
};

// Save database to disk
function saveDB() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write database file:', e);
  }
}

// Load database from disk
export function initDB() {
  if (fs.existsSync(dbFile)) {
    try {
      const data = fs.readFileSync(dbFile, 'utf8');
      store = JSON.parse(data);
    } catch (e) {
      saveDB();
    }
  } else {
    saveDB();
  }
  console.log('✅ Relational Database Schema Initialized Successfully (database.json)');
}

const db = {
  prepare: (sql) => {
    return {
      get: (...params) => {
        if (sql.includes('FROM users WHERE google_id = ? OR email = ?')) {
          return store.users.find(u => u.google_id === params[0] || u.email === params[1]);
        }
        if (sql.includes('FROM users WHERE id = ?')) {
          return store.users.find(u => u.id == params[0]);
        }
        if (sql.includes('FROM users WHERE email = ?')) {
          return store.users.find(u => u.email === params[0]);
        }
        if (sql.includes('FROM sessions WHERE session_token = ?')) {
          return store.sessions.find(s => s.session_token === params[0]);
        }
        if (sql.includes('FROM security_tokens WHERE token = ?')) {
          return store.security_tokens.find(t => t.token === params[0]);
        }
        return null;
      },

      all: (...params) => {
        if (sql.includes('FROM login_history WHERE user_id = ?')) {
          return store.login_history.filter(l => l.user_id == params[0]);
        }
        if (sql.includes('FROM sessions WHERE user_id = ?')) {
          return store.sessions.filter(s => s.user_id == params[0]);
        }
        if (sql.includes('FROM email_logs WHERE recipient = ?')) {
          return store.email_logs.filter(e => e.recipient === params[0]);
        }
        return [];
      },

      run: (...params) => {
        if (sql.includes('INSERT INTO users')) {
          const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
          const user = {
            id: newId,
            google_id: params[0],
            email: params[1],
            name: params[2],
            avatar: params[3],
            provider: params[4] || 'google',
            verified: params[5] || 1,
            role: params[6] || 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          };
          store.users.push(user);
          saveDB();
          return { lastInsertRowid: newId };
        }

        if (sql.includes('UPDATE users')) {
          const user = store.users.find(u => u.id == params[3] || u.id == params[0]);
          if (user) {
            user.name = params[0] || user.name;
            user.avatar = params[1] || user.avatar;
            user.updated_at = new Date().toISOString();
            if (params[2]) user.email = params[2];
            saveDB();
          }
          return { changes: 1 };
        }

        if (sql.includes('INSERT INTO authentications')) {
          store.authentications.push({
            id: Date.now(),
            user_id: params[0],
            provider: params[1],
            provider_user_id: params[2],
            created_at: new Date().toISOString()
          });
          saveDB();
          return { lastInsertRowid: Date.now() };
        }

        if (sql.includes('INSERT INTO sessions')) {
          store.sessions.push({
            id: Date.now(),
            user_id: params[0],
            session_token: params[1],
            ip_address: params[2],
            user_agent: params[3],
            expires_at: params[4],
            created_at: new Date().toISOString()
          });
          saveDB();
          return { lastInsertRowid: Date.now() };
        }

        if (sql.includes('INSERT INTO login_history')) {
          store.login_history.push({
            id: Date.now(),
            user_id: params[0],
            ip_address: params[1],
            user_agent: params[2],
            status: params[3] || 'SUCCESS',
            created_at: new Date().toISOString()
          });
          saveDB();
          return { lastInsertRowid: Date.now() };
        }

        if (sql.includes('INSERT INTO email_logs')) {
          store.email_logs.push({
            id: Date.now(),
            recipient: params[0],
            subject: params[1],
            email_type: params[2],
            status: params[3],
            message_id: params[4],
            error_message: params[5],
            sent_at: new Date().toISOString()
          });
          saveDB();
          return { lastInsertRowid: Date.now() };
        }

        if (sql.includes('DELETE FROM users WHERE id = ?')) {
          store.users = store.users.filter(u => u.id != params[0]);
          saveDB();
          return { changes: 1 };
        }

        if (sql.includes('DELETE FROM sessions WHERE session_token = ?')) {
          store.sessions = store.sessions.filter(s => s.session_token !== params[0]);
          saveDB();
          return { changes: 1 };
        }

        return { changes: 1 };
      }
    };
  }
};

export default db;
