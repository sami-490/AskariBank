import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  account_number: string;
  balance: number;
  role: string;
  reset_token: string | null;
  reset_token_expiry: number | null;
  created_at: string;
}

type Variables = {
  jwtPayload: {
    sub: string;
    email: string;
    role: string;
    exp: number;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware
app.use('*', cors());

// Default secret for development
const JWT_SECRET = 'askaribank-super-secret';

// Helper to generate account number
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Signup Route
app.post('/api/auth/register', async (c) => {
  try {
    const { name, email, password, role } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ message: 'Please provide all fields' }, 400);
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ message: 'User already exists' }, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = crypto.randomUUID();
    const accountNumber = generateAccountNumber();
    const userRole = role === 'admin' ? 'admin' : 'user';

    // Ensure status/blocked_until columns exist
    try { await c.env.DB.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'").run(); } catch (e) {}
    try { await c.env.DB.prepare("ALTER TABLE users ADD COLUMN blocked_until INTEGER DEFAULT 0").run(); } catch (e) {}

    // Create user
    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password, account_number, role, status, blocked_until) VALUES (?, ?, ?, ?, ?, ?, 'active', 0)",
    )
      .bind(userId, name, email, hashedPassword, accountNumber, userRole)
      .run();

    // Create default settings
    await c.env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();

    // Create a default card
    const cardId = crypto.randomUUID();
    const cardNumber = '4532' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const expiry = '12/28';
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    await c.env.DB.prepare(
      'INSERT INTO cards (id, user_id, card_type, card_number, expiry, cvv) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(cardId, userId, 'Visa Gold', cardNumber, expiry, cvv)
      .run();

    // Generate JWT
    const secret = c.env.JWT_SECRET || JWT_SECRET;
    const payload = {
      sub: userId,
      email: email,
      role: userRole,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, secret);

    return c.json(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          name,
          email,
          accountNumber,
          balance: 0,
          role: userRole,
        },
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return c.json({ message }, 500);
  }
});

// Login Route
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ message: 'Please provide email and password' }, 400);
    }

    // Run dynamic migrations at login
    try {
      await c.env.DB.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'").run();
    } catch (e) {}
    try {
      await c.env.DB.prepare("ALTER TABLE users ADD COLUMN blocked_until INTEGER DEFAULT 0").run();
    } catch (e) {}

    // Find user
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User & { status: string; blocked_until: number }>();

    if (!user) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    // Check block status
    const status = user.status || 'active';
    const blockedUntil = user.blocked_until || 0;

    if (status === 'blocked') {
      return c.json({ message: 'Your account has been permanently blocked by an administrator.' }, 403);
    } else if (status === 'temp_blocked') {
      if (blockedUntil > Date.now()) {
        const remainingMs = blockedUntil - Date.now();
        const minutes = Math.ceil(remainingMs / 60000);
        return c.json({ message: `Your account is temporarily blocked. Please try again in ${minutes} minute(s).` }, 403);
      } else {
        // Auto-unblock expired temp blocks
        await c.env.DB.prepare("UPDATE users SET status = 'active', blocked_until = 0 WHERE id = ?")
          .bind(user.id)
          .run();
        user.status = 'active';
        user.blocked_until = 0;
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ message: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const secret = c.env.JWT_SECRET || JWT_SECRET;
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, secret);

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        accountNumber: user.account_number,
        balance: user.balance,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return c.json({ message }, 500);
  }
});

// Forgot Password Route
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    if (!user) {
      return c.json({ message: 'User with this email does not exist' }, 404);
    }

    const resetToken = crypto.randomUUID();
    const expiry = Date.now() + 3600000; // 1 hour

    await c.env.DB.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
      .bind(resetToken, expiry, user.id)
      .run();

    // MOCK EMAIL SENDING
    console.log('--------------------------------------------------');
    console.log(`RESET LINK: http://localhost:5173/reset-password/${resetToken}`);
    console.log('--------------------------------------------------');

    return c.json({ message: 'Password reset link sent to email' });
  } catch {
    return c.json({ message: 'Error in forgot password' }, 500);
  }
});

// Reset Password Route
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, password } = await c.req.json();

    const user = await c.env.DB.prepare(
      'SELECT id, reset_token_expiry FROM users WHERE reset_token = ?',
    )
      .bind(token)
      .first<User>();

    if (!user || (user.reset_token_expiry && user.reset_token_expiry < Date.now())) {
      return c.json({ message: 'Invalid or expired token' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await c.env.DB.prepare(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    )
      .bind(hashedPassword, user.id)
      .run();

    return c.json({ message: 'Password reset successful' });
  } catch {
    return c.json({ message: 'Error in reset password' }, 500);
  }
});

// Get Profile (Protected)
app.get('/api/auth/me', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;

  // Run dynamic migrations at me fetch
  try {
    await c.env.DB.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'").run();
  } catch (e) {}
  try {
    await c.env.DB.prepare("ALTER TABLE users ADD COLUMN blocked_until INTEGER DEFAULT 0").run();
  } catch (e) {}

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, account_number, balance, role, phone, avatar, status, blocked_until FROM users WHERE id = ?',
  )
    .bind(userId)
    .first<User & { status: string; blocked_until: number }>();

  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  // Check block status
  const status = user.status || 'active';
  const blockedUntil = user.blocked_until || 0;

  if (status === 'blocked') {
    return c.json({ success: false, message: 'Your account has been permanently blocked by an administrator.' }, 403);
  } else if (status === 'temp_blocked') {
    if (blockedUntil > Date.now()) {
      const remainingMs = blockedUntil - Date.now();
      const minutes = Math.ceil(remainingMs / 60000);
      return c.json({ success: false, message: `Your account is temporarily blocked. Please try again in ${minutes} minute(s).` }, 403);
    } else {
      // Auto-unblock expired temp blocks
      await c.env.DB.prepare("UPDATE users SET status = 'active', blocked_until = 0 WHERE id = ?")
        .bind(user.id)
        .run();
      user.status = 'active';
      user.blocked_until = 0;
    }
  }

  const settings = await c.env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    .bind(userId)
    .first();

  const cards = await c.env.DB.prepare('SELECT * FROM cards WHERE user_id = ?').bind(userId).all();
  const mappedCards = (cards.results || []).map((card: any) => ({
    ...card,
    _id: card.id,
    cardType: card.card_type,
    cardNumber: card.card_number,
  }));

  const data = {
    ...user,
    _id: user.id,
    id: user.id,
    accountNumber: user.account_number,
    settings: settings || {},
    cards: mappedCards,
  };

  return c.json({ success: true, data });
});

// --- USER OPERATIONS ---

// Get User Transactions
app.get('/api/user/transactions', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
  )
    .bind(userId)
    .all();

  return c.json(results);
});

// Transfer Money
app.post('/api/user/transfer', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const senderId = payload.sub;
  const { recipientAccount, amount, type, targetType, recipientName } = await c.req.json();

  if (!recipientAccount || !amount || amount <= 0) {
    return c.json({ message: 'Invalid recipient or amount' }, 400);
  }

  try {
    // Check block status
    const senderCheck = await c.env.DB.prepare('SELECT status, blocked_until FROM users WHERE id = ?')
      .bind(senderId)
      .first<{ status: string; blocked_until: number }>();

    if (senderCheck) {
      const status = senderCheck.status || 'active';
      const blockedUntil = senderCheck.blocked_until || 0;
      if (status === 'blocked') {
        return c.json({ message: 'Your account is blocked.' }, 403);
      } else if (status === 'temp_blocked' && blockedUntil > Date.now()) {
        return c.json({ message: 'Your account is temporarily blocked.' }, 403);
      }
    }

    // 1. Check sender balance
    const sender = await c.env.DB.prepare('SELECT balance FROM users WHERE id = ?')
      .bind(senderId)
      .first<User>();

    if (!sender || sender.balance < amount) {
      return c.json({ message: 'Insufficient balance' }, 400);
    }

    if (targetType === 'askaribank' || !targetType) {
      // Handle Internal Wallet Actions (Withdrawal, Exchange, etc.)
      if (recipientAccount === 'WALLET-OUT') {
        await c.env.DB.batch([
          c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(
            amount,
            senderId,
          ),
          c.env.DB.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(
            crypto.randomUUID(),
            senderId,
            type || 'withdraw',
            amount,
            recipientName || 'Wallet Action',
            'completed',
          ),
        ]);
        return c.json({ success: true, message: 'Transaction successful' });
      }

      // Try Internal Transfer first
      const recipient = await c.env.DB.prepare('SELECT id FROM users WHERE account_number = ?')
        .bind(recipientAccount)
        .first<User>();

      if (recipient) {
        if (recipient.id === senderId) {
          return c.json({ message: 'Cannot transfer to yourself' }, 400);
        }

        await c.env.DB.batch([
          c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(
            amount,
            senderId,
          ),
          c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(
            amount,
            recipient.id,
          ),
          c.env.DB.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(
            crypto.randomUUID(),
            senderId,
            type || 'send',
            amount,
            recipientAccount,
            'completed',
          ),
          c.env.DB.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(
            crypto.randomUUID(),
            recipient.id,
            'receive',
            amount,
            'Internal Transfer',
            'completed',
          ),
        ]);
      } else {
        // Not found in internal DB -> Treat as External Bank Transfer
        await c.env.DB.batch([
          c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(
            amount,
            senderId,
          ),
          c.env.DB.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(
            crypto.randomUUID(),
            senderId,
            'send',
            amount,
            `BANK: ${recipientAccount} (${recipientName || 'External'})`,
            'completed',
          ),
        ]);
      }
    } else {
      // External Transfer (JazzCash, EasyPaisa, etc.)
      await c.env.DB.batch([
        c.env.DB.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').bind(
          amount,
          senderId,
        ),
        c.env.DB.prepare(
          'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
        ).bind(
          crypto.randomUUID(),
          senderId,
          'send',
          amount,
          `${targetType.toUpperCase()}: ${recipientAccount} (${recipientName || 'External'})`,
          'completed',
        ),
      ]);
    }

    return c.json({ success: true, message: 'Transfer successful' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transfer failed';
    return c.json({ message }, 500);
  }
});

// Recharge Account
app.post('/api/user/recharge', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;
  const { amount } = await c.req.json();

  if (!amount || amount <= 0) {
    return c.json({ message: 'Invalid amount' }, 400);
  }

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(amount, userId),
    c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
    ).bind(crypto.randomUUID(), userId, 'receive', amount, 'Account Recharge', 'completed'),
  ]);

  return c.json({ success: true, message: 'Recharge successful' });
});

// Card Management
app.put('/api/user/cards/:id', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;
  const cardId = c.req.param('id');

  const card = await c.env.DB.prepare('SELECT status FROM cards WHERE id = ? AND user_id = ?')
    .bind(cardId, userId)
    .first<{ status: string }>();

  if (!card) return c.json({ message: 'Card not found' }, 404);

  // If permanently blocked, user can't toggle it!
  if (card.status === 'blocked' || card.status === 'permanently_blocked') {
    return c.json({ message: 'This card has been permanently blocked by an administrator.' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const field = body?.field;

  if (field) {
    // Toggling contactless, international, onlinePayments
    try {
      await c.env.DB.prepare(`ALTER TABLE cards ADD COLUMN ${field} INTEGER DEFAULT 1`).run();
    } catch {}

    const currentVal = await c.env.DB.prepare(`SELECT ${field} FROM cards WHERE id = ?`).bind(cardId).first<any>();
    const nextVal = currentVal?.[field] === 0 || currentVal?.[field] === false ? 1 : 0;
    await c.env.DB.prepare(`UPDATE cards SET ${field} = ? WHERE id = ?`).bind(nextVal, cardId).run();
    return c.json({ success: true });
  } else {
    // Normal freeze toggle
    const newStatus = card.status === 'active' ? 'frozen' : 'active';
    await c.env.DB.prepare('UPDATE cards SET status = ? WHERE id = ?').bind(newStatus, cardId).run();
    return c.json({ success: true, status: newStatus });
  }
});

// Create New Card
app.post('/api/user/cards', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;
  const { type } = await c.req.json(); // 'virtual' or 'physical'

  const cardId = crypto.randomUUID();
  const cardNumber =
    (type === 'virtual' ? '4532' : '5412') +
    Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const expiry = '12/28';
  const cvv = Math.floor(100 + Math.random() * 900).toString();
  const brand = type === 'virtual' ? 'VISA' : 'Mastercard';

  await c.env.DB.prepare(
    'INSERT INTO cards (id, user_id, card_type, card_number, expiry, cvv) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(cardId, userId, brand, cardNumber, expiry, cvv)
    .run();

  return c.json({ success: true, message: 'Card created successfully' });
});

// Get User Profile & Related Data
app.get('/api/user/profile', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, account_number, balance, role, status, blocked_until FROM users WHERE id = ?',
  )
    .bind(userId)
    .first<User & { status: string; blocked_until: number }>();

  if (!user) return c.json({ message: 'User not found' }, 404);

  // Check block status
  const status = user.status || 'active';
  const blockedUntil = user.blocked_until || 0;

  if (status === 'blocked') {
    return c.json({ message: 'Your account has been permanently blocked by an administrator.' }, 403);
  } else if (status === 'temp_blocked' && blockedUntil > Date.now()) {
    return c.json({ message: 'Your account is temporarily blocked.' }, 403);
  }

  const cards = await c.env.DB.prepare('SELECT * FROM cards WHERE user_id = ?').bind(userId).all();
  const mappedCards = (cards.results || []).map((card: any) => ({
    ...card,
    _id: card.id,
    cardType: card.card_type,
    cardNumber: card.card_number,
  }));

  const settings = await c.env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    .bind(userId)
    .first();

  return c.json({
    success: true,
    user: {
      ...user,
      _id: user.id,
      accountNumber: user.account_number,
    },
    cards: mappedCards,
    settings,
  });
});

// Update User Profile
app.put('/api/user/profile', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;
  const { name, email, phone, avatar } = await c.req.json();

  // Primitive migration: Ensure columns exist
  try {
    await c.env.DB.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
    await c.env.DB.prepare('ALTER TABLE users ADD COLUMN avatar TEXT').run();
  } catch {
    // Columns likely already exist
  }

  await c.env.DB.prepare('UPDATE users SET name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?')
    .bind(name, email, phone, avatar, userId)
    .run();

  return c.json({ success: true, message: 'Profile updated' });
});

// Update User Settings
app.put('/api/user/settings', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  const payload = c.get('jwtPayload');
  const userId = payload.sub;
  const settings = await c.req.json();

  const current = await c.env.DB.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    .bind(userId)
    .first();

  if (!current) {
    await c.env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();
  }

  // Primitive migration: Ensure columns exist
  try {
    await c.env.DB.prepare(
      'ALTER TABLE user_settings ADD COLUMN transaction_alerts INTEGER DEFAULT 1',
    ).run();
    await c.env.DB.prepare(
      'ALTER TABLE user_settings ADD COLUMN promotions INTEGER DEFAULT 0',
    ).run();
    await c.env.DB.prepare(
      'ALTER TABLE user_settings ADD COLUMN analytics_sharing INTEGER DEFAULT 1',
    ).run();
    await c.env.DB.prepare(
      'ALTER TABLE user_settings ADD COLUMN personalized_offers INTEGER DEFAULT 0',
    ).run();
    await c.env.DB.prepare(
      'ALTER TABLE user_settings ADD COLUMN theme TEXT DEFAULT "system"',
    ).run();
  } catch {
    // Columns likely already exist
  }

  const fields = Object.keys(settings);
  for (const field of fields) {
    const val = settings[field];
    // Map frontend keys to DB columns
    const dbField =
      field === 'biometric_login'
        ? 'biometric_login'
        : field === 'two_factor_auth'
          ? 'two_factor_auth'
          : field === 'email_notifications'
            ? 'email_notifications'
            : field === 'push_notifications'
              ? 'push_notifications'
              : field === 'transaction_alerts'
                ? 'transaction_alerts'
                : field === 'promotions'
                  ? 'promotions'
                  : field === 'analytics_sharing'
                    ? 'analytics_sharing'
                    : field === 'personalized_offers'
                      ? 'personalized_offers'
                      : field === 'theme'
                        ? 'theme'
                        : null;

    if (dbField) {
      const finalVal = typeof val === 'boolean' ? (val ? 1 : 0) : val;
      await c.env.DB.prepare(`UPDATE user_settings SET ${dbField} = ? WHERE user_id = ?`)
        .bind(finalVal, userId)
        .run();
    }
  }

  return c.json({ success: true, message: 'Settings updated' });
});

// --- ADMIN SCHEMA MIGRATIONS & ENDPOINTS ---

async function ensureSchema(db: D1Database) {
  // users updates
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN blocked_until INTEGER DEFAULT 0").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN phone TEXT").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN avatar TEXT").run();
  } catch (e) {}

  // cards updates
  try {
    await db.prepare("ALTER TABLE cards ADD COLUMN contactless INTEGER DEFAULT 1").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE cards ADD COLUMN international INTEGER DEFAULT 1").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE cards ADD COLUMN onlinePayments INTEGER DEFAULT 1").run();
  } catch (e) {}

  // transactions updates
  try {
    await db.prepare("ALTER TABLE transactions ADD COLUMN target_type TEXT").run();
  } catch (e) {}

  // Create new tables
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_email TEXT,
      loan_type TEXT,
      amount REAL,
      tenure_months INTEGER,
      income_monthly REAL,
      remarks TEXT,
      status TEXT DEFAULT 'pending',
      feedback TEXT,
      date_applied DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      merchant_code TEXT UNIQUE,
      category TEXT,
      logo_url TEXT,
      total_collected REAL DEFAULT 0,
      settled_amount REAL DEFAULT 0,
      pending_settlement REAL DEFAULT 0
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS vault_logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      log_type TEXT,
      organization TEXT,
      amount REAL,
      details TEXT
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS gold_spread (
      id TEXT PRIMARY KEY,
      buy_price REAL,
      sell_price REAL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      user_email TEXT,
      subject TEXT,
      message TEXT,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS ticket_replies (
      id TEXT PRIMARY KEY,
      ticket_id TEXT,
      sender TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      event_type TEXT,
      email TEXT,
      ip_address TEXT,
      details TEXT,
      severity TEXT
    )
  `).run();

  // Seed default gold spread if not exists
  try {
    const existing = await db.prepare("SELECT buy_price FROM gold_spread LIMIT 1").first();
    if (!existing) {
      await db.prepare("INSERT INTO gold_spread (id, buy_price, sell_price) VALUES (?, ?, ?)")
        .bind("default", 12500, 12700)
        .run();
    }
  } catch (e) {}

  // Seed default institutions if not exists
  try {
    const existing = await db.prepare("SELECT id FROM institutions LIMIT 1").first();
    if (!existing) {
      const defaultInsts = [
        { id: "1", name: "Saylani Welfare Trust", code: "SAYLANI", cat: "Welfare & Zakat", logo: "/logos/saylani.png" },
        { id: "2", name: "Edhi Foundation", code: "EDHI", cat: "Charity", logo: "/logos/edhi.png" },
        { id: "3", name: "Chhipa Welfare Association", code: "CHHIPA", cat: "Ambulance & Welfare", logo: "/logos/chhipa.png" }
      ];
      for (const inst of defaultInsts) {
        await db.prepare("INSERT INTO institutions (id, name, merchant_code, category, logo_url) VALUES (?, ?, ?, ?, ?)")
          .bind(inst.id, inst.name, inst.code, inst.cat, inst.logo)
          .run();
      }
    }
  } catch (e) {}
}

const adminMiddleware = async (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: () => Promise<void>,
) => {
  const payload = c.get('jwtPayload');
  if (payload.role !== 'admin') {
    return c.json({ message: 'Access denied. Admins only.' }, 403);
  }
  await ensureSchema(c.env.DB);
  await next();
};

// GET /api/admin/users
app.get(
  '/api/admin/users',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, email, account_number, balance, role, created_at, COALESCE(status, 'active') as status, COALESCE(blocked_until, 0) as blocked_until FROM users",
    ).all<User & { status: string; blocked_until: number }>();

    const mappedResults = results.map((u) => ({
      ...u,
      _id: u.id,
      accountNumber: u.account_number,
    }));

    return c.json({ success: true, data: mappedResults });
  },
);

// POST /api/admin/users
app.post(
  '/api/admin/users',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { name, email, password, role } = await c.req.json();
    if (!name || !email || !password) {
      return c.json({ message: 'Please provide all fields' }, 400);
    }

    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ message: 'User already exists' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = crypto.randomUUID();
    const accountNumber = generateAccountNumber();
    const userRole = role === 'admin' ? 'admin' : 'user';

    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password, account_number, role, status, blocked_until) VALUES (?, ?, ?, ?, ?, ?, 'active', 0)",
    )
      .bind(userId, name, email, hashedPassword, accountNumber, userRole)
      .run();

    await c.env.DB.prepare('INSERT INTO user_settings (user_id) VALUES (?)').bind(userId).run();

    const cardId = crypto.randomUUID();
    const cardNumber = '4532' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const expiry = '12/28';
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    await c.env.DB.prepare(
      'INSERT INTO cards (id, user_id, card_type, card_number, expiry, cvv, status, card_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(cardId, userId, 'Visa Gold', cardNumber, expiry, cvv, 'active', 50000)
      .run();

    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO security_logs (id, event_type, email, ip_address, details, severity) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(logId, 'USER_CREATION', email, '127.0.0.1', `Account created by administrator. Role: ${userRole}`, 'info')
      .run();

    return c.json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: userId,
        _id: userId,
        name,
        email,
        accountNumber,
        balance: 0,
        role: userRole,
        status: 'active',
      }
    });
  }
);

// DELETE /api/admin/users/:id
app.delete(
  '/api/admin/users/:id',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return c.json({ message: 'User deleted permanently' });
  },
);

// POST /api/admin/users/:id/adjust-balance
app.post(
  '/api/admin/users/:id/adjust-balance',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const id = c.req.param('id');
    const { amount, reason } = await c.req.json();
    const val = Number(amount);
    if (isNaN(val)) return c.json({ message: 'Invalid amount' }, 400);

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User & { status: string; blocked_until: number }>();

    if (!user) return c.json({ message: 'User not found' }, 404);

    const newBalance = (user.balance || 0) + val;
    await c.env.DB.prepare('UPDATE users SET balance = ? WHERE id = ?')
      .bind(newBalance, id)
      .run();

    const txnId = crypto.randomUUID();
    const type = val >= 0 ? 'receive' : 'send';
    await c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(txnId, id, type, Math.abs(val), `Admin Adjustment: ${reason || 'Correction'}`, 'completed')
      .run();

    return c.json({
      success: true,
      data: {
        ...user,
        _id: user.id,
        accountNumber: user.account_number,
        balance: newBalance,
      }
    });
  }
);

// GET /api/admin/transactions
app.get(
  '/api/admin/transactions',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { results } = await c.env.DB.prepare(
      'SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.date DESC',
    ).all();
    const mapped = (results || []).map((t: any) => ({
      ...t,
      _id: t.id,
      userName: t.user_name,
      userEmail: t.user_email,
    }));
    return c.json({ success: true, data: mapped });
  },
);

// POST /api/admin/transactions/:txnId/reverse
app.post(
  '/api/admin/transactions/:txnId/reverse',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const txnId = c.req.param('txnId');
    const tx = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?')
      .bind(txnId)
      .first<any>();

    if (!tx) return c.json({ message: 'Transaction not found' }, 404);

    if (tx.status === 'reversed') {
      return c.json({ message: 'Transaction is already reversed' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(tx.user_id)
      .first<User>();

    if (!user) return c.json({ message: 'User not found' }, 404);

    let balanceChange = 0;
    if (tx.type === 'send' || tx.type === 'purchase' || tx.type === 'withdraw' || tx.type === 'investment') {
      balanceChange = tx.amount;
    } else if (tx.type === 'receive') {
      balanceChange = -tx.amount;
    }

    const newBalance = (user.balance || 0) + balanceChange;

    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE users SET balance = ? WHERE id = ?').bind(newBalance, tx.user_id),
      c.env.DB.prepare("UPDATE transactions SET status = 'reversed' WHERE id = ?").bind(txnId),
      c.env.DB.prepare(
        'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
      ).bind(
        crypto.randomUUID(),
        tx.user_id,
        tx.type === 'send' ? 'receive' : 'send',
        tx.amount,
        `REVERSAL of transaction ${txnId}`,
        'completed'
      ),
    ]);

    return c.json({ success: true, message: 'Transaction reversed successfully' });
  }
);

// POST /api/admin/users/:id/block
app.post(
  '/api/admin/users/:id/block',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const id = c.req.param('id');
    const { type, duration } = await c.req.json();

    let status = 'active';
    let blockedUntil = 0;

    if (type === 'permanent') {
      status = 'blocked';
    } else if (type === 'temporary') {
      status = 'temp_blocked';
      blockedUntil = Date.now() + (duration || 300000);
    }

    await c.env.DB.prepare('UPDATE users SET status = ?, blocked_until = ? WHERE id = ?')
      .bind(status, blockedUntil, id)
      .run();

    const user = await c.env.DB.prepare('SELECT id, name, email, account_number, balance, role, status, blocked_until FROM users WHERE id = ?')
      .bind(id)
      .first<User & { status: string; blocked_until: number }>();

    if (!user) return c.json({ message: 'User not found' }, 404);

    return c.json({
      success: true,
      message: `User blocked successfully as ${type}`,
      data: {
        ...user,
        _id: user.id,
        accountNumber: user.account_number,
      }
    });
  }
);

// POST /api/admin/users/:id/unblock
app.post(
  '/api/admin/users/:id/unblock',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const id = c.req.param('id');

    await c.env.DB.prepare("UPDATE users SET status = 'active', blocked_until = 0 WHERE id = ?")
      .bind(id)
      .run();

    const user = await c.env.DB.prepare('SELECT id, name, email, account_number, balance, role, status, blocked_until FROM users WHERE id = ?')
      .bind(id)
      .first<User & { status: string; blocked_until: number }>();

    if (!user) return c.json({ message: 'User not found' }, 404);

    return c.json({
      success: true,
      message: 'User unblocked successfully',
      data: {
        ...user,
        _id: user.id,
        accountNumber: user.account_number,
      }
    });
  }
);

// GET /api/admin/users/:id/cards
app.get(
  '/api/admin/users/:id/cards',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const userId = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM cards WHERE user_id = ?')
      .bind(userId)
      .all();

    const mapped = (results || []).map((card: any) => ({
      ...card,
      _id: card.id,
      cardType: card.card_type,
      cardNumber: card.card_number,
    }));

    return c.json(mapped);
  }
);

// GET /api/admin/loans
app.get(
  '/api/admin/loans',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM loans ORDER BY date_applied DESC',
    ).all();
    const mapped = (results || []).map((l: any) => ({
      ...l,
      _id: l.id,
      userId: l.user_id,
      userName: l.user_name,
      userEmail: l.user_email,
      loanType: l.loan_type,
      tenureMonths: l.tenure_months,
      incomeMonthly: l.income_monthly,
      dateApplied: l.date_applied,
    }));
    return c.json({ success: true, data: mapped });
  }
);

// POST /api/admin/loans/:loanId/status
app.post(
  '/api/admin/loans/:loanId/status',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const loanId = c.req.param('loanId');
    const { status, remarks } = await c.req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ message: 'Status must be approved or rejected' }, 400);
    }

    const loan = await c.env.DB.prepare('SELECT * FROM loans WHERE id = ?')
      .bind(loanId)
      .first<any>();

    if (!loan) return c.json({ message: 'Loan request not found' }, 404);

    await c.env.DB.prepare('UPDATE loans SET status = ?, remarks = ? WHERE id = ?')
      .bind(status, remarks || loan.remarks, loanId)
      .run();

    if (status === 'approved') {
      const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(loan.user_id)
        .first<User>();

      if (user) {
        const newBalance = (user.balance || 0) + loan.amount;
        await c.env.DB.batch([
          c.env.DB.prepare('UPDATE users SET balance = ? WHERE id = ?').bind(newBalance, user.id),
          c.env.DB.prepare(
            'INSERT INTO transactions (id, user_id, type, amount, recipient, status) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(
            crypto.randomUUID(),
            user.id,
            'receive',
            loan.amount,
            `Approved Loan: ${loan.loan_type}`,
            'completed'
          )
        ]);
      }
    }

    const updatedLoan = await c.env.DB.prepare('SELECT * FROM loans WHERE id = ?')
      .bind(loanId)
      .first<any>();

    return c.json({
      success: true,
      data: {
        ...updatedLoan,
        _id: updatedLoan.id,
        userId: updatedLoan.user_id,
        userName: updatedLoan.user_name,
        userEmail: updatedLoan.user_email,
        loanType: updatedLoan.loan_type,
        tenureMonths: updatedLoan.tenure_months,
        incomeMonthly: updatedLoan.income_monthly,
        dateApplied: updatedLoan.date_applied,
      }
    });
  }
);

// GET /api/admin/institutions
app.get(
  '/api/admin/institutions',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM institutions',
    ).all();
    const mapped = (results || []).map((i: any) => ({
      ...i,
      _id: i.id,
      merchantCode: i.merchant_code,
      logoUrl: i.logo_url,
      totalCollected: i.total_collected,
      settledAmount: i.settled_amount,
      pendingSettlement: i.pending_settlement,
    }));
    return c.json({ success: true, data: mapped });
  }
);

// POST /api/admin/institutions
app.post(
  '/api/admin/institutions',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { name, merchantCode, category } = await c.req.json();
    if (!name || !merchantCode) {
      return c.json({ message: 'Please provide name and merchantCode' }, 400);
    }

    const instId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO institutions (id, name, merchant_code, category, logo_url, total_collected, settled_amount, pending_settlement) VALUES (?, ?, ?, ?, ?, 0, 0, 0)',
    )
      .bind(instId, name, merchantCode, category || 'Education', '/logos/default.png')
      .run();

    const inst = await c.env.DB.prepare('SELECT * FROM institutions WHERE id = ?')
      .bind(instId)
      .first<any>();

    return c.json({
      success: true,
      data: {
        ...inst,
        _id: inst.id,
        merchantCode: inst.merchant_code,
        logoUrl: inst.logo_url,
        totalCollected: inst.total_collected,
        settledAmount: inst.settled_amount,
        pendingSettlement: inst.pending_settlement,
      }
    });
  }
);

// GET /api/admin/zakat
app.get(
  '/api/admin/zakat',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const txs = await c.env.DB.prepare(
      "SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.target_type = 'zakat' OR LOWER(t.recipient) LIKE '%zakat%'"
    ).all();

    const contributions = (txs.results || []).map((t: any) => ({
      ...t,
      _id: t.id,
      userName: t.user_name,
      userEmail: t.user_email,
    }));

    const totalZakatCollected = contributions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

    const disbursementsRes = await c.env.DB.prepare(
      "SELECT * FROM vault_logs WHERE log_type = 'ZAKAT_DISBURSEMENT' ORDER BY timestamp DESC"
    ).all();

    const disbursements = (disbursementsRes.results || []).map((d: any) => ({
      ...d,
      _id: d.id,
      organizationName: d.organization,
      date: d.timestamp,
    }));

    const totalDisbursed = disbursements.reduce((acc: number, d: any) => acc + (d.amount || 0), 0);

    return c.json({
      success: true,
      data: {
        totalZakatCollected,
        totalDisbursed,
        remainingBalance: totalZakatCollected - totalDisbursed,
        contributions,
        disbursements,
      }
    });
  }
);

// POST /api/admin/zakat/disburse
app.post(
  '/api/admin/zakat/disburse',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { organizationName, amount, remarks } = await c.req.json();
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      return c.json({ message: 'Invalid disbursement amount' }, 400);
    }

    const txs = await c.env.DB.prepare(
      "SELECT SUM(amount) as total FROM transactions WHERE target_type = 'zakat' OR LOWER(recipient) LIKE '%zakat%'"
    ).first<{ total: number }>();
    const totalCollected = txs?.total || 0;

    const disbursedRes = await c.env.DB.prepare(
      "SELECT SUM(amount) as total FROM vault_logs WHERE log_type = 'ZAKAT_DISBURSEMENT'"
    ).first<{ total: number }>();
    const totalDisbursed = disbursedRes?.total || 0;

    const remainingReserve = totalCollected - totalDisbursed;

    if (remainingReserve < val) {
      return c.json({ message: 'Insufficient funds in Zakat reserve.' }, 400);
    }

    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO vault_logs (id, log_type, organization, amount, details) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(logId, 'ZAKAT_DISBURSEMENT', organizationName, val, remarks || `Disbursement of Zakat funds to ${organizationName}`)
      .run();

    const newLog = await c.env.DB.prepare('SELECT * FROM vault_logs WHERE id = ?')
      .bind(logId)
      .first<any>();

    return c.json({
      success: true,
      message: 'Zakat funds disbursed successfully',
      data: {
        ...newLog,
        _id: newLog.id,
        organizationName: newLog.organization,
        date: newLog.timestamp,
      }
    });
  }
);

// GET /api/admin/gold
app.get(
  '/api/admin/gold',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const txs = await c.env.DB.prepare(
      "SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.target_type = 'gold' OR LOWER(t.recipient) LIKE '%gold%'"
    ).all();

    const goldSpread = await c.env.DB.prepare(
      "SELECT * FROM gold_spread LIMIT 1"
    ).first<{ buy_price: number; sell_price: number }>() || { buy_price: 12500, sell_price: 12700 };

    const holdingsMap: Record<string, { userId: string; userName: string; email: string; grams: number }> = {};
    for (const t of (txs.results || [])) {
      const uId = t.user_id;
      if (!holdingsMap[uId]) {
        holdingsMap[uId] = {
          userId: uId,
          userName: t.user_name || 'User',
          email: t.user_email || '',
          grams: 0
        };
      }
      const isSell = t.type === 'receive' || t.type === 'withdraw';
      const factor = isSell ? -1 : 1;
      const grams = (t.amount || 0) / goldSpread.buy_price;
      holdingsMap[uId].grams += grams * factor;
    }

    const goldHoldings = Object.values(holdingsMap).filter(h => h.grams > 0).map((h, i) => ({
      ...h,
      _id: `h_${i}`,
      id: `h_${i}`,
    }));

    const totalAllocatedGrams = goldHoldings.reduce((acc, h) => acc + h.grams, 0);

    const auditLogsRes = await c.env.DB.prepare(
      "SELECT * FROM vault_logs WHERE log_type = 'GOLD_AUDIT' ORDER BY timestamp DESC"
    ).all();

    const vaultAuditLogs = (auditLogsRes.results || []).map((l: any) => ({
      ...l,
      _id: l.id,
      date: l.timestamp,
    }));

    return c.json({
      success: true,
      data: {
        totalAllocatedGrams,
        goldHoldings,
        goldSpread: {
          buyPrice: goldSpread.buy_price,
          sellPrice: goldSpread.sell_price,
        },
        vaultAuditLogs,
      }
    });
  }
);

// POST /api/admin/gold/pricing
app.post(
  '/api/admin/gold/pricing',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { buyPrice, sellPrice } = await c.req.json();
    const buyVal = Number(buyPrice);
    const sellVal = Number(sellPrice);

    if (isNaN(buyVal) || isNaN(sellVal)) {
      return c.json({ message: 'Invalid buy or sell prices' }, 400);
    }

    await c.env.DB.prepare("DELETE FROM gold_spread").run();

    const id = crypto.randomUUID();
    await c.env.DB.prepare('INSERT INTO gold_spread (id, buy_price, sell_price) VALUES (?, ?, ?)')
      .bind(id, buyVal, sellVal)
      .run();

    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO vault_logs (id, log_type, organization, amount, details) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(logId, 'GOLD_AUDIT', 'AskariBank Depot', 0, `Gold prices adjusted by admin. Live buy: ${buyVal}, sell: ${sellVal}`)
      .run();

    return c.json({
      success: true,
      message: 'Gold price spreads adjusted successfully',
      data: {
        buyPrice: buyVal,
        sellPrice: sellVal,
      }
    });
  }
);

// GET /api/admin/tickets
app.get(
  '/api/admin/tickets',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const ticketsRes = await c.env.DB.prepare(
      "SELECT * FROM tickets ORDER BY created_at DESC"
    ).all();

    const tickets = [];
    for (const t of (ticketsRes.results || [])) {
      const repliesRes = await c.env.DB.prepare(
        "SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC"
      ).bind(t.id).all();

      const replies = (repliesRes.results || []).map((r: any) => ({
        ...r,
        _id: r.id,
        createdAt: r.created_at,
      }));

      tickets.push({
        ...t,
        _id: t.id,
        userId: t.user_id,
        userName: t.user_name,
        userEmail: t.user_email,
        createdAt: t.created_at,
        replies,
      });
    }

    return c.json({ success: true, data: tickets });
  }
);

// Ticket replies post handlers
const ticketReplyHandler = async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const ticketId = c.req.param('ticketId');
  const { message } = await c.req.json();

  if (!message) {
    return c.json({ message: 'Reply message cannot be empty' }, 400);
  }

  const ticket = await c.env.DB.prepare('SELECT * FROM tickets WHERE id = ?')
    .bind(ticketId)
    .first<any>();

  if (!ticket) {
    return c.json({ message: 'Ticket not found' }, 404);
  }

  const replyId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO ticket_replies (id, ticket_id, sender, message) VALUES (?, ?, ?, ?)'
  )
    .bind(replyId, ticketId, 'Admin Support', message)
    .run();

  await c.env.DB.prepare("UPDATE tickets SET status = 'resolved' WHERE id = ?")
    .bind(ticketId)
    .run();

  const repliesRes = await c.env.DB.prepare(
    'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC'
  ).bind(ticketId).all();

  const replies = (repliesRes.results || []).map((r: any) => ({
    ...r,
    _id: r.id,
    createdAt: r.created_at,
  }));

  const updatedTicket = await c.env.DB.prepare('SELECT * FROM tickets WHERE id = ?')
    .bind(ticketId)
    .first<any>();

  return c.json({
    success: true,
    message: 'Reply posted and ticket resolved',
    data: {
      ...updatedTicket,
      _id: updatedTicket.id,
      userId: updatedTicket.user_id,
      userName: updatedTicket.user_name,
      userEmail: updatedTicket.user_email,
      createdAt: updatedTicket.created_at,
      replies,
    }
  });
};

app.post('/api/admin/tickets/:ticketId/reply', jwt({ secret: JWT_SECRET, alg: 'HS256' }), adminMiddleware, ticketReplyHandler);
app.post('/api/api/admin/tickets/:ticketId/reply', jwt({ secret: JWT_SECRET, alg: 'HS256' }), adminMiddleware, ticketReplyHandler);

// GET /api/admin/security-logs
app.get(
  '/api/admin/security-logs',
  jwt({ secret: JWT_SECRET, alg: 'HS256' }),
  adminMiddleware,
  async (c) => {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM security_logs ORDER BY timestamp DESC',
    ).all();
    const mapped = (results || []).map((l: any) => ({
      ...l,
      _id: l.id,
      ipAddress: l.ip_address,
      eventType: l.event_type,
    }));
    return c.json({ success: true, data: mapped });
  }
);

// Card block handlers
const blockCardHandler = async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
  const cardId = c.req.param('cardId');
  await c.env.DB.prepare("UPDATE cards SET status = 'blocked' WHERE id = ?")
    .bind(cardId)
    .run();

  return c.json({ success: true, message: 'Card permanently blocked' });
};

app.post('/api/cards/:cardId/block', jwt({ secret: JWT_SECRET, alg: 'HS256' }), adminMiddleware, blockCardHandler);
app.post('/api/admin/cards/:cardId/block', jwt({ secret: JWT_SECRET, alg: 'HS256' }), adminMiddleware, blockCardHandler);

app.get('/', (c) => {
  return c.text('AskariBank API is Running!');
});

export default app;
