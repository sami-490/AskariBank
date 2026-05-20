const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, genId } = require('../db');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Helper to read raw JSON db
const readRawDB = () => {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

// Helper to write raw JSON db
const writeRawDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// ── MODULE 1: USER & PROFILE MANAGEMENT ──────────────────────────────────────

exports.getAllUsers = async (req, res) => {
  try {
    const db = readRawDB();
    const safeUsers = db.users.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ success: true, data: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, balance } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const db = readRawDB();
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user',
      balance: balance !== undefined ? Number(balance) : 0
    });

    // Log the user creation security event
    db.securityLogs.push({
      _id: genId(),
      timestamp: new Date().toISOString(),
      eventType: 'USER_CREATED',
      email: email,
      ipAddress: req.ip || '127.0.0.1',
      details: `User manually created by administrator: ${email}`,
      severity: 'low'
    });
    writeRawDB(db);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active' or 'frozen'

    if (!['active', 'frozen'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active or frozen' });
    }

    const user = User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = status;
    User.save(user);

    // Audit Log
    const db = readRawDB();
    db.securityLogs.push({
      _id: genId(),
      timestamp: new Date().toISOString(),
      eventType: status === 'frozen' ? 'ACCOUNT_FROZEN' : 'ACCOUNT_UNFROZEN',
      email: user.email,
      ipAddress: req.ip || '127.0.0.1',
      details: `User account status updated to ${status} by admin.`,
      severity: status === 'frozen' ? 'medium' : 'low'
    });
    writeRawDB(db);

    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adjustBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body; // can be positive or negative

    const val = Number(amount);
    if (isNaN(val)) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const user = User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.balance += val;
    user.transactions.unshift({
      _id: genId(),
      transactionId: `TXN-ADJ-${Date.now().toString(36).toUpperCase()}`,
      type: val >= 0 ? 'receive' : 'send',
      amount: Math.abs(val),
      recipient: `Admin Adjustment: ${reason || 'Correction'}`,
      date: new Date().toISOString(),
      status: 'completed'
    });

    User.save(user);
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = readRawDB();
    const userIndex = db.users.findIndex(u => u._id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const deletedUser = db.users.splice(userIndex, 1)[0];
    db.securityLogs.push({
      _id: genId(),
      timestamp: new Date().toISOString(),
      eventType: 'USER_DELETED',
      email: deletedUser.email,
      ipAddress: req.ip || '127.0.0.1',
      details: `User account deleted by admin: ${deletedUser.email}`,
      severity: 'high'
    });
    writeRawDB(db);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 2: TRANSACTION & FINANCIAL AUDIT ──────────────────────────────────

exports.getAllTransactions = async (req, res) => {
  try {
    const db = readRawDB();
    const list = [];

    db.users.forEach(u => {
      if (u.transactions) {
        u.transactions.forEach(t => {
          list.push({
            ...t,
            userEmail: u.email,
            userName: u.name,
            userId: u._id
          });
        });
      }
    });

    // Sort by date descending
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Audit summary stats
    const totalUsers = db.users.length;
    const totalTransactions = list.length;
    const totalInflow = list.filter(t => t.type === 'receive').reduce((acc, t) => acc + t.amount, 0);
    const totalOutflow = list.filter(t => t.type === 'send' || t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
    const totalFees = list.filter(t => t.recipient?.includes('Fee') || t.targetType === 'fees').reduce((acc, t) => acc + t.amount, 0);

    res.json({
      success: true,
      data: list,
      stats: {
        totalUsers,
        totalTransactions,
        totalInflow,
        totalOutflow,
        totalFees
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reverseTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const db = readRawDB();
    
    let foundUser = null;
    let foundTx = null;

    db.users.forEach(u => {
      const tx = u.transactions?.find(t => t.transactionId === transactionId || t._id === transactionId);
      if (tx) {
        foundUser = u;
        foundTx = tx;
      }
    });

    if (!foundTx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (foundTx.status === 'reversed') {
      return res.status(400).json({ success: false, message: 'Transaction is already reversed' });
    }

    // Refund the user balance
    if (foundTx.type === 'send' || foundTx.type === 'purchase') {
      foundUser.balance += foundTx.amount;
    } else if (foundTx.type === 'receive') {
      foundUser.balance -= foundTx.amount;
    }

    foundTx.status = 'reversed';
    foundUser.transactions.unshift({
      _id: genId(),
      transactionId: `TXN-REV-${Date.now().toString(36).toUpperCase()}`,
      type: foundTx.type === 'send' ? 'receive' : 'send',
      amount: foundTx.amount,
      recipient: `REVERSAL of ${foundTx.transactionId}`,
      date: new Date().toISOString(),
      status: 'completed'
    });

    writeRawDB(db);

    res.json({ success: true, message: 'Transaction reversed successfully', data: foundTx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 3: LOAN UNDERWRITING & PROCESSING ─────────────────────────────────

exports.getLoans = async (req, res) => {
  try {
    const db = readRawDB();
    res.json({ success: true, data: db.loans || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { status, remarks } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const db = readRawDB();
    const loan = db.loans.find(l => l._id === loanId);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan request not found' });

    loan.status = status;
    loan.remarks = remarks || loan.remarks;

    if (status === 'approved') {
      // Find user and credit the loan amount
      const user = db.users.find(u => u.email === loan.userEmail || u.accountNumber === loan.userAccount);
      if (user) {
        user.balance += loan.amount;
        user.transactions.unshift({
          _id: genId(),
          transactionId: `TXN-LOAN-${Date.now().toString(36).toUpperCase()}`,
          type: 'receive',
          amount: loan.amount,
          recipient: `Approved Loan: ${loan.loanType}`,
          date: new Date().toISOString(),
          status: 'completed'
        });
      }
    }

    writeRawDB(db);
    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 4: INSTITUTIONAL FEE PORTAL MANAGEMENT ───────────────────────────

exports.getInstitutions = async (req, res) => {
  try {
    const db = readRawDB();
    res.json({ success: true, data: db.institutions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addInstitution = async (req, res) => {
  try {
    const { name, merchantCode, category } = req.body;
    if (!name || !merchantCode) {
      return res.status(400).json({ success: false, message: 'Name and merchant code are required' });
    }

    const db = readRawDB();
    if (db.institutions.some(i => i.merchantCode === merchantCode)) {
      return res.status(400).json({ success: false, message: 'Merchant code already exists' });
    }

    const newInst = {
      _id: genId(),
      name,
      merchantCode,
      category: category || 'Education',
      logoUrl: 'default_logo',
      totalCollected: 0,
      settledAmount: 0,
      pendingSettlement: 0
    };

    db.institutions.push(newInst);
    writeRawDB(db);

    res.status(201).json({ success: true, data: newInst });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 5: ZAKAT & CHARITY DISTRIBUTION ───────────────────────────────────

exports.getZakatMetrics = async (req, res) => {
  try {
    const db = readRawDB();
    
    // Scan all transactions for Zakat contributions
    const zakatTransactions = [];
    db.users.forEach(u => {
      if (u.transactions) {
        u.transactions.forEach(t => {
          if (t.targetType === 'zakat' || t.recipient?.toLowerCase().includes('zakat')) {
            zakatTransactions.push({ ...t, userEmail: u.email, userName: u.name });
          }
        });
      }
    });

    const totalZakatCollected = zakatTransactions.reduce((acc, t) => acc + t.amount, 0);

    // Let's filter disbursements from secondary list
    const disbursements = db.vaultLogs?.filter(log => log.logType === 'ZAKAT_DISBURSEMENT') || [];
    const totalDisbursed = disbursements.reduce((acc, d) => acc + d.amount, 0);

    res.json({
      success: true,
      data: {
        totalZakatCollected,
        totalDisbursed,
        remainingBalance: totalZakatCollected - totalDisbursed,
        contributions: zakatTransactions,
        disbursements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.disburseZakat = async (req, res) => {
  try {
    const { organizationName, amount, remarks } = req.body;
    const disburseAmount = Number(amount);

    if (!organizationName || isNaN(disburseAmount) || disburseAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid organization name or amount' });
    }

    const db = readRawDB();
    
    // Add disbursement to logs
    const newLog = {
      _id: genId(),
      timestamp: new Date().toISOString(),
      logType: 'ZAKAT_DISBURSEMENT',
      organization: organizationName,
      amount: disburseAmount,
      details: remarks || `Disbursement of Zakat funds to ${organizationName}`
    };

    db.vaultLogs.push(newLog);
    writeRawDB(db);

    res.json({ success: true, message: 'Zakat funds disbursed successfully', data: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 6: DIGITAL GOLD BACKING & VAULT LOGISTICS ─────────────────────────

exports.getGoldVault = async (req, res) => {
  try {
    const db = readRawDB();
    
    // Find all users digital gold allocations
    const goldHoldings = [];
    db.users.forEach(u => {
      if (u.transactions) {
        // Let's check gold transactions (type: buy gold, mutual-fund for gold, etc.)
        const grams = u.transactions
          .filter(t => t.recipient?.includes('Gold') || t.targetType === 'gold')
          .reduce((acc, t) => acc + (t.type === 'receive' ? -t.amount : t.amount) / 12500, 0); // Mock gram conversion based on base gold rate 12500

        if (grams > 0) {
          goldHoldings.push({
            userId: u._id,
            userName: u.name,
            userEmail: u.email,
            grams: Number(grams.toFixed(2))
          });
        }
      }
    });

    const totalAllocatedGrams = goldHoldings.reduce((acc, h) => acc + h.grams, 0);
    const vaultAuditLogs = db.vaultLogs?.filter(log => log.logType === 'GOLD_AUDIT') || [];

    res.json({
      success: true,
      data: {
        totalAllocatedGrams,
        goldHoldings,
        goldSpread: db.goldSpread || { buyPrice: 12500, sellPrice: 12700 },
        vaultAuditLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGoldPricing = async (req, res) => {
  try {
    const { buyPrice, sellPrice } = req.body;
    
    const buyVal = Number(buyPrice);
    const sellVal = Number(sellPrice);

    if (isNaN(buyVal) || isNaN(sellVal) || buyVal <= 0 || sellVal <= 0) {
      return res.status(400).json({ success: false, message: 'Prices must be positive numbers' });
    }

    const db = readRawDB();
    db.goldSpread = { buyPrice: buyVal, sellPrice: sellVal };
    
    db.vaultLogs.push({
      _id: genId(),
      timestamp: new Date().toISOString(),
      logType: 'GOLD_AUDIT',
      details: `Gold prices adjusted by admin. Live buy: ${buyVal}, sell: ${sellVal}`
    });

    writeRawDB(db);
    res.json({ success: true, message: 'Gold price spreads adjusted successfully', data: db.goldSpread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── MODULE 7: SECURITY, SUPPORT & COMPLIANCE ────────────────────────────────

exports.getSupportTickets = async (req, res) => {
  try {
    const db = readRawDB();
    res.json({ success: true, data: db.tickets || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replySupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const db = readRawDB();
    const ticket = db.tickets.find(t => t._id === ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.status = 'resolved';
    ticket.replies.push({
      _id: genId(),
      sender: 'System Admin',
      message,
      createdAt: new Date().toISOString()
    });

    writeRawDB(db);
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const db = readRawDB();
    res.json({ success: true, data: db.securityLogs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const db = readRawDB();
    const user = db.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Admin user not found' });

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(password, salt);
    user.isFirstLogin = false; // clear the flag

    const idx = db.users.findIndex(u => u._id === user._id);
    db.users[idx] = user;
    writeRawDB(db);

    res.json({ success: true, message: 'Password updated successfully. Security compliance cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

