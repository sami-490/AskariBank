const crypto = require('crypto');
const { User, genId } = require('../db');
const {
  setPendingOtp,
  clearPendingOtp,
  verifyOtpCode,
  maskPhone,
  OTP_TTL_MS,
} = require('../utils/otpStore');
const { sendTransferOtpSms, isSmsConfigured } = require('../utils/sms');

const PLATFORM_LABELS = {
  bank: 'Bank Transfer',
  askaribank: 'Askari Bank',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  nayapay: 'NayaPay',
  sadapay: 'SadaPay',
  upaisa: 'UPaisa',
};

const generateTransactionId = () =>
  `TXN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const executeTransfer = (user, payload) => {
  const {
    recipientAccount,
    recipientName,
    amount,
    targetType,
    purpose,
    description,
    bankName,
    idempotencyKey,
  } = payload;

  const transferAmount = Number(amount);
  if (!transferAmount || transferAmount <= 0) {
    return { error: 'Invalid transfer amount', status: 400 };
  }
  if (user.balance < transferAmount) {
    return { error: 'Insufficient balance for transfer', status: 400 };
  }

  if (idempotencyKey && user.transactions?.some((t) => t.idempotencyKey === idempotencyKey)) {
    return { error: 'Duplicate transaction detected', status: 409 };
  }

  const platform = targetType || 'bank';
  const platformLabel = PLATFORM_LABELS[platform] || platform;
  const transactionId = generateTransactionId();

  user.balance -= transferAmount;
  user.transactions.unshift({
    _id: genId(),
    transactionId,
    type: 'send',
    amount: transferAmount,
    recipient: `${recipientName || 'Recipient'} — ${platformLabel}`,
    recipientAccount,
    recipientName: recipientName || recipientAccount,
    purpose: purpose || description || 'Transfer',
    description: description || purpose || '',
    bankName: bankName || null,
    targetType: platform,
    platform: platformLabel,
    date: new Date().toISOString(),
    status: 'completed',
    idempotencyKey: idempotencyKey || null,
  });

  User.save(user);
  return { success: true, transactionId, platform: platformLabel };
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, phone, avatar } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    User.save(user);

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Card Field (Freeze / Contactless / International / onlinePayments) ─
exports.toggleCardStatus = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const card = user.cards.find(c => c._id === req.params.cardId);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    const { field } = req.body;
    if (field && ['contactless', 'international', 'onlinePayments'].includes(field)) {
      card[field] = !card[field];
    } else {
      card.status = card.status === 'active' ? 'frozen' : 'active';
    }

    User.save(user);
    res.json({ success: true, data: user.cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Purchase Card ─────────────────────────────────────────────────────────────
const CARD_PRICES = {
  'Platinum Elite': 5000,
  'Digital Creator': 2500,
  'Secure Saver':   3500,
  'Eco-Friendly':   1500,
};

exports.purchaseCard = async (req, res) => {
  try {
    const { variety, cardType } = req.body;
    const price = CARD_PRICES[variety] || 2500;
    const user  = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Your account is frozen by compliance. Operations suspended.' });
    }

    if (user.balance < price) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to purchase card' });
    }

    user.balance -= price;

    const cardColors = ['dark', 'blue', 'slate', 'green'];
    const color = cardColors[user.cards.length % cardColors.length];

    const newCard = {
      _id: genId(),
      cardType: cardType || 'VISA',
      cardVariety: variety,
      cardNumber: Array.from({ length: 4 }, () =>
        Math.floor(1000 + Math.random() * 9000)
      ).join(' '),
      expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${(new Date().getFullYear() + 5).toString().slice(-2)}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      status: 'active',
      contactless: true,
      international: true,
      onlinePayments: true,
      color,
    };

    user.cards.push(newCard);

    user.transactions.unshift({
      _id: genId(),
      type: 'purchase',
      amount: price,
      recipient: `New Card — ${variety}`,
      date: new Date().toISOString(),
      status: 'completed',
    });

    User.save(user);

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Settings ───────────────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.settings = { ...user.settings, ...req.body };
    User.save(user);

    res.json({ success: true, data: user.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Add Transaction ───────────────────────────────────────────────────────────
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, recipient } = req.body;
    const user = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Your account is frozen by compliance. Operations suspended.' });
    }

    if (type === 'send' && user.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    if (type === 'send')    user.balance -= Number(amount);
    if (type === 'receive') user.balance += Number(amount);

    user.transactions.unshift({
      _id: genId(),
      type,
      amount: Number(amount),
      recipient,
      date: new Date().toISOString(),
      status: 'completed',
    });

    User.save(user);

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Transfer Money (legacy — prefer OTP flow) ─────────────────────────────────
exports.transferMoney = async (req, res) => {
  try {
    const { recipientAccount, recipientName, amount, targetType, purpose } = req.body;
    const user = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Your account is frozen by compliance. Operations suspended.' });
    }
    if (!recipientAccount) {
      return res.status(400).json({ success: false, message: 'Recipient account is required' });
    }

    const result = executeTransfer(user, {
      recipientAccount,
      recipientName,
      amount,
      targetType,
      purpose,
    });

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Save beneficiary ──────────────────────────────────────────────────────────
const saveBeneficiary = (user, data) => {
  if (!user.beneficiaries) user.beneficiaries = [];
  const exists = user.beneficiaries.find(
    (b) => b.account === data.account && b.platform === data.platform
  );
  if (!exists) {
    user.beneficiaries.unshift({
      _id: genId(),
      name: data.name,
      account: data.account,
      platform: data.platform,
      bankName: data.bankName || null,
      createdAt: new Date().toISOString(),
    });
    user.beneficiaries = user.beneficiaries.slice(0, 20);
    User.save(user);
  }
};

// ── Request transfer OTP (sent to registered mobile) ──────────────────────────
exports.requestTransferOtp = async (req, res) => {
  try {
    const {
      recipientAccount,
      recipientName,
      amount,
      targetType,
      purpose,
      description,
      bankName,
      saveBeneficiary: shouldSave,
    } = req.body;
    const user = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Your account is frozen by compliance. Operations suspended.' });
    }
    if (!recipientAccount) {
      return res.status(400).json({ success: false, message: 'Recipient account is required' });
    }

    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }
    if (user.balance < transferAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for transfer' });
    }

    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: 'No phone number on your profile. Add your mobile in Settings to receive SMS OTP.',
      });
    }

    const phone = user.phone;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resolvedName = recipientName || recipientAccount;
    const platform = targetType || 'bank';

    const sessionId = await setPendingOtp(user._id, code, {
      recipientAccount,
      recipientName: resolvedName,
      amount: transferAmount,
      targetType: platform,
      purpose: purpose || description || 'Transfer',
      description: description || purpose || '',
      bankName: bankName || null,
      saveBeneficiary: Boolean(shouldSave),
    });

    let smsResult;
    try {
      smsResult = await sendTransferOtpSms(phone, {
        code,
        amount: transferAmount,
        recipientName: resolvedName,
      });
    } catch (smsErr) {
      clearPendingOtp(user._id);
      return res.status(502).json({
        success: false,
        message: smsErr.message || 'Could not send SMS. Check your phone number in Settings.',
      });
    }

    if (!smsResult.delivered && !isSmsConfigured()) {
      console.log(`[AskariBank OTP] Dev fallback — ${user.email}: ${code} → ${phone}`);
    }

    res.json({
      success: true,
      message: smsResult.delivered
        ? 'OTP sent via SMS to your registered mobile. Check Google Messages.'
        : 'OTP generated (SMS not configured — see server console for dev code)',
      maskedPhone: maskPhone(phone),
      smsDelivered: smsResult.delivered,
      sessionId,
      code,
      expiresIn: Math.floor(OTP_TTL_MS / 1000),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Aliases per API spec
exports.generateOtp = exports.requestTransferOtp;

// ── Confirm OTP and complete transfer ─────────────────────────────────────────
exports.confirmTransferOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const verification = await verifyOtpCode(user._id, otp);
    if (!verification.ok) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
        attemptsLeft: verification.attemptsLeft,
        locked: verification.locked,
      });
    }

    const { payload } = verification.record;
    const result = executeTransfer(user, payload);
    clearPendingOtp(user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    if (payload.saveBeneficiary) {
      saveBeneficiary(user, {
        name: payload.recipientName,
        account: payload.recipientAccount,
        platform: payload.targetType,
        bankName: payload.bankName,
      });
    }

    const latestTx = user.transactions[0];
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      data: safeUser,
      transactionId: result.transactionId,
      platform: result.platform,
      transaction: latestTx,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOtp = exports.confirmTransferOtp;

exports.sendMoney = async (req, res) => {
  return exports.requestTransferOtp(req, res);
};

exports.getBeneficiaries = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.beneficiaries || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Transactions ──────────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json([]);

    res.json(user.transactions || []);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Recharge Wallet ───────────────────────────────────────────────────────────
exports.rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Your account is frozen by compliance. Operations suspended.' });
    }

    const rechargeAmount = Number(amount);
    if (!rechargeAmount || rechargeAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid recharge amount' });
    }

    user.balance += rechargeAmount;

    user.transactions.unshift({
      _id: genId(),
      type: 'receive',
      amount: rechargeAmount,
      recipient: 'Wallet Recharge / Top Up',
      targetType: 'askaribank',
      date: new Date().toISOString(),
      status: 'completed',
    });

    User.save(user);

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
