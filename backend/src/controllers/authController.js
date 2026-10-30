/**
 * WhatsAssist - Auth Controller
 * Handles business logic for Customer, Store Owner, and Store Manager signup & login.
 * Uses bcrypt (cost factor 12) for password hashing and JWT for sessions.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Merchant = require('../models/merchant');

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Generate a signed JWT token for a given user/merchant.
 * @param {Object} merchant - merchant DB row
 * @returns {string} signed JWT
 */
function generateToken(merchant) {
  return jwt.sign(
    {
      id: merchant.id,
      email: merchant.email,
      business_name: merchant.business_name,
      name: merchant.name || merchant.business_name,
      role: merchant.role || 'owner',
    },
    process.env.JWT_SECRET || 'whatsassist_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────
/**
 * Register a new account (Customer or Store Owner / Manager).
 */
const signup = async (req, res) => {
  try {
    const {
      account_type,
      role,
      name,
      business_name,
      email,
      password,
      phone_number,
      business_category
    } = req.body;

    const assignedRole = (account_type === 'customer' || role === 'customer')
      ? 'customer'
      : (role === 'manager' ? 'manager' : 'owner');

    const displayName = (assignedRole === 'customer')
      ? (name || business_name || 'Customer').trim()
      : (business_name || 'ZepTech').trim();

    // ── Input Validation ──────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (assignedRole !== 'customer' && !business_name) {
      return res.status(400).json({
        success: false,
        message: 'Business Name is required for Store Owner/Manager registration.',
      });
    }

    if (assignedRole === 'customer' && !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Your Name is required for Customer registration.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // ── Uniqueness Check ──────────────────────────────────────
    if (Merchant.emailExists(email)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Password Hashing ──────────────────────────────────────
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // ── Create Record ─────────────────────────────────────────
    const newAccount = Merchant.create({
      business_name: displayName,
      name: displayName,
      email: email.toLowerCase().trim(),
      password_hash,
      phone_number: phone_number || null,
      business_category: assignedRole === 'customer' ? 'Customer' : (business_category || 'Electronics & Household Appliances'),
      role: assignedRole,
    });

    // ── Issue JWT ─────────────────────────────────────────────
    const token = generateToken(newAccount);

    const welcomeMsg = assignedRole === 'customer'
      ? `Welcome to ZepTech Electronics Store, ${displayName}!`
      : `Welcome to WhatsAssist Workstation, ${displayName}!`;

    return res.status(201).json({
      success: true,
      message: welcomeMsg,
      token,
      merchant: Merchant.sanitize(newAccount),
    });
  } catch (error) {
    console.error('❌ [Auth] Signup error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
/**
 * Authenticate an existing user (Customer, Owner, or Manager).
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const account = Merchant.findByEmail(email);
    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!account.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, account.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    Merchant.touchUpdatedAt(account.id);
    const token = generateToken(account);

    const roleTitle = account.role === 'customer'
      ? 'Shopper'
      : (account.role === 'manager' ? 'Store Manager' : 'Store Owner');

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${account.name || account.business_name} (${roleTitle})!`,
      token,
      merchant: Merchant.sanitize(account),
    });
  } catch (error) {
    console.error('❌ [Auth] Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────
const getMe = (req, res) => {
  try {
    const merchant = Merchant.findById(req.merchant.id);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }
    return res.status(200).json({
      success: true,
      merchant: Merchant.sanitize(merchant),
    });
  } catch (error) {
    console.error('❌ [Auth] getMe error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { signup, login, getMe };
