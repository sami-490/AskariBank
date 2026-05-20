-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  account_number TEXT UNIQUE,
  balance REAL DEFAULT 0,
  role TEXT DEFAULT 'user',
  reset_token TEXT,
  reset_token_expiry INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_type TEXT,
  card_number TEXT UNIQUE,
  expiry TEXT,
  cvv TEXT,
  status TEXT DEFAULT 'active',
  card_limit REAL DEFAULT 50000,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT, -- 'send', 'receive', 'withdraw', 'exchange'
  amount REAL,
  recipient TEXT,
  status TEXT DEFAULT 'completed',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  biometric_login INTEGER DEFAULT 1,
  two_factor_auth INTEGER DEFAULT 0,
  email_notifications INTEGER DEFAULT 1,
  push_notifications INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'system',
  FOREIGN KEY (user_id) REFERENCES users(id)
);
