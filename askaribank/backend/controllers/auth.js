const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User } = require('../db');
const { sendResetEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const user   = User.create({ name, email, password: hashed, phone: phone || '', role });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        role: user.role || 'user',
        status: user.status || 'active',
        isFirstLogin: user.isFirstLogin || false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        role: user.role || 'user',
        status: user.status || 'active',
        isFirstLogin: user.isFirstLogin || false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Don't send password
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address.' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink  = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, user.name, resetLink);
      res.json({ success: true, message: `Recovery link sent to ${user.email}. Check your inbox.` });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
      res.json({
        success: true,
        message: 'Recovery link generated (email failed — configure EMAIL_USER/EMAIL_PASS in .env).',
        resetLink,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isFirstLogin = false;
    User.save(user);

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
  }
};
