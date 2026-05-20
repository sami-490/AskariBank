/**
 * Local JSON File Database — replaces MongoDB entirely.
 * All data is saved to: backend/data/db.json
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => crypto.randomBytes(12).toString('hex');

const initDB = () => {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(
        {
          users: [],
          loans: [],
          institutions: [],
          tickets: [],
          vaultLogs: [],
          securityLogs: [],
          goldSpread: { buyPrice: 12500, sellPrice: 12700 },
        },
        null,
        2,
      ),
      'utf8',
    );
  } else {
    // Read and ensure all keys exist
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    let changed = false;
    if (!db.users) {
      db.users = [];
      changed = true;
    }
    if (!db.loans) {
      db.loans = [];
      changed = true;
    }
    if (!db.institutions) {
      db.institutions = [];
      changed = true;
    }
    if (!db.tickets) {
      db.tickets = [];
      changed = true;
    }
    if (!db.vaultLogs) {
      db.vaultLogs = [];
      changed = true;
    }
    if (!db.securityLogs) {
      db.securityLogs = [];
      changed = true;
    }
    if (!db.goldSpread) {
      db.goldSpread = { buyPrice: 12500, sellPrice: 12700 };
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    }
  }

  // Seed default admin if missing
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const adminExists = db.users.some(
    (u) => u.role === 'admin' || u.email === 'admin@askaribank.com',
  );
  if (!adminExists) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('Admin123!', salt);
    const adminUser = {
      _id: crypto.randomBytes(12).toString('hex'),
      name: 'System Administrator',
      email: 'admin@askaribank.com',
      phone: '+92 3193790030',
      password: hashedPassword,
      accountNumber: '888999111222',
      balance: 100000000,
      role: 'admin',
      status: 'active',
      isFirstLogin: true,
      cards: [],
      transactions: [],
      settings: {
        biometricLogin: true,
        twoFactorAuth: false,
        notifications: { email: true, push: true, transactions: true, promotions: false },
        appearance: { theme: 'system' },
      },
      createdAt: new Date().toISOString(),
    };
    db.users.push(adminUser);

    // Seed some mock support tickets
    db.tickets.push(
      {
        _id: crypto.randomBytes(12).toString('hex'),
        userEmail: 'samiullah2004@gmail.com',
        userName: 'Sami Ullah',
        subject: 'Pending Card Delivery Query',
        message:
          'Hello, my Eco-Friendly Mastercard has been active for 3 days but I have not received the tracking details yet. Can you please check on this?',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        replies: [],
      },
      {
        _id: crypto.randomBytes(12).toString('hex'),
        userEmail: 'islamworld806@gmail.com',
        userName: 'Shafiq',
        subject: 'Incorrect OTP Block Error',
        message:
          'I tried sending money but entered the wrong OTP code twice and got locked. Can you please unlock my profile?',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        replies: [],
      },
    );

    // Seed mock security event logs
    db.securityLogs.push(
      {
        _id: crypto.randomBytes(12).toString('hex'),
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        eventType: 'LOGIN_FAILURE',
        email: 'attacker@evil.com',
        ipAddress: '198.51.100.42',
        details: 'Attempted login failed: Invalid credentials.',
        severity: 'medium',
      },
      {
        _id: crypto.randomBytes(12).toString('hex'),
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        eventType: 'HIGH_VALUE_TRANSFER_ALERT',
        email: 'samiullah2004@gmail.com',
        ipAddress: '39.40.122.18',
        details: 'High value transfer generated for Rs. 500,000 to Saylani Welfare.',
        severity: 'high',
      },
    );

    // Seed mock loan applications
    db.loans.push(
      {
        _id: crypto.randomBytes(12).toString('hex'),
        userEmail: 'samiullah2004@gmail.com',
        userName: 'Sami Ullah',
        userAccount: '288339629556',
        loanType: 'Car Loan',
        amount: 1500000,
        tenureMonths: 36,
        incomeMonthly: 250000,
        remarks: 'Require financing for purchase of civic hybrid.',
        status: 'pending',
        dateApplied: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        _id: crypto.randomBytes(12).toString('hex'),
        userEmail: 'islamworld806@gmail.com',
        userName: 'Shafiq',
        userAccount: '443435437212',
        loanType: 'Personal Loan',
        amount: 300000,
        tenureMonths: 12,
        incomeMonthly: 95000,
        remarks: 'Medical emergency funding.',
        status: 'pending',
        dateApplied: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    );

    // Seed some mock partnered institutions
    db.institutions.push(
      {
        _id: crypto.randomBytes(12).toString('hex'),
        name: 'National University of Sciences & Technology (NUST)',
        merchantCode: 'MERCH-NUST-01',
        category: 'Education',
        logoUrl: 'nust_logo',
        totalCollected: 450000,
        settledAmount: 300000,
        pendingSettlement: 150000,
      },
      {
        _id: crypto.randomBytes(12).toString('hex'),
        name: 'FAST NUCES',
        merchantCode: 'MERCH-FAST-02',
        category: 'Education',
        logoUrl: 'fast_logo',
        totalCollected: 250000,
        settledAmount: 250000,
        pendingSettlement: 0,
      },
    );

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  }
};

const readDB = () => {
  initDB();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// ── User Model ────────────────────────────────────────────────────────────────

const User = {
  /** Find a user by email or _id */
  findOne(query) {
    const { users } = readDB();
    if (query.email) return users.find((u) => u.email === query.email) || null;
    if (query._id) return users.find((u) => u._id === query._id) || null;
    return null;
  },

  findById(id) {
    const { users } = readDB();
    return users.find((u) => u._id === id) || null;
  },

  /** Create and persist a new user, returns the full user object */
  create(data) {
    const db = readDB();
    const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const user = {
      _id: genId(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password, // already hashed by caller
      accountNumber: data.accountNumber || accountNumber,
      balance: data.balance !== undefined ? data.balance : 0,
      role: data.role || 'user',
      cards: [],
      transactions: [],
      settings: {
        biometricLogin: true,
        twoFactorAuth: false,
        notifications: { email: true, push: true, transactions: true, promotions: false },
        appearance: { theme: 'system' },
      },
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDB(db);
    return user;
  },

  /** Persist changes to an existing user object */
  save(user) {
    const db = readDB();
    const idx = db.users.findIndex((u) => u._id === user._id);
    if (idx !== -1) {
      db.users[idx] = user;
    } else {
      db.users.push(user);
    }
    writeDB(db);
    return user;
  },
};

initDB();

module.exports = { User, genId };
