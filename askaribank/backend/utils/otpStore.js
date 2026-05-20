const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const OTP_TTL_MS = 60 * 1000;
const MAX_ATTEMPTS = 3;
const OTP_DB_PATH = path.join(__dirname, '../data/otp-verifications.json');

const readOtpDb = () => {
  try {
    if (!fs.existsSync(OTP_DB_PATH)) {
      fs.writeFileSync(OTP_DB_PATH, JSON.stringify({ verifications: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(OTP_DB_PATH, 'utf8'));
  } catch {
    return { verifications: [] };
  }
};

const writeOtpDb = (data) => {
  fs.writeFileSync(OTP_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const pending = new Map();

const maskPhone = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 4) return 'your registered mobile';
  const prefix = digits.length > 4 ? digits.slice(0, Math.min(3, digits.length - 4)) : '';
  return prefix ? `+${prefix} ***${digits.slice(-4)}` : `***${digits.slice(-4)}`;
};

const logVerification = (entry) => {
  const db = readOtpDb();
  db.verifications.unshift({
    ...entry,
    createdAt: new Date().toISOString(),
  });
  db.verifications = db.verifications.slice(0, 500);
  writeOtpDb(db);
};

const setPendingOtp = async (userId, code, payload) => {
  const codeHash = await bcrypt.hash(String(code), 10);
  const sessionId = crypto.randomBytes(16).toString('hex');

  pending.set(userId, {
    sessionId,
    codeHash,
    attempts: 0,
    locked: false,
    expiresAt: Date.now() + OTP_TTL_MS,
    payload: { ...payload, idempotencyKey: sessionId },
    createdAt: Date.now(),
  });

  logVerification({
    userId,
    sessionId,
    action: 'generated',
    platform: payload.targetType,
    amount: payload.amount,
    status: 'pending',
  });

  return sessionId;
};

const getPendingOtp = (userId) => pending.get(userId) || null;

const clearPendingOtp = (userId) => pending.delete(userId);

const verifyOtpCode = async (userId, otp) => {
  const record = getPendingOtp(userId);
  if (!record) {
    return { ok: false, status: 400, message: 'No pending transfer. Please request OTP again.' };
  }
  if (record.locked) {
    return { ok: false, status: 423, message: 'Transaction locked after too many failed attempts. Request a new OTP.' };
  }
  if (Date.now() > record.expiresAt) {
    clearPendingOtp(userId);
    logVerification({
      userId,
      sessionId: record.sessionId,
      action: 'expired',
      status: 'failed',
    });
    return { ok: false, status: 400, message: 'OTP expired. Please request a new code.' };
  }

  const match = await bcrypt.compare(String(otp), record.codeHash);
  if (!match) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.locked = true;
      logVerification({
        userId,
        sessionId: record.sessionId,
        action: 'locked',
        attempts: record.attempts,
        status: 'locked',
      });
      return {
        ok: false,
        status: 423,
        message: 'Too many invalid attempts. Transaction locked. Request a new OTP.',
        attemptsLeft: 0,
        locked: true,
      };
    }
    return {
      ok: false,
      status: 400,
      message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      attemptsLeft: remaining,
      locked: false,
    };
  }

  logVerification({
    userId,
    sessionId: record.sessionId,
    action: 'verified',
    status: 'success',
  });

  return { ok: true, record };
};

module.exports = {
  setPendingOtp,
  getPendingOtp,
  clearPendingOtp,
  verifyOtpCode,
  maskPhone,
  OTP_TTL_MS,
  MAX_ATTEMPTS,
};
