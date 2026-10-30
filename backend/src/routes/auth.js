/**
 * WhatsAssist - Auth Routes
 * Defines all authentication-related endpoints.
 *
 * Public Routes:
 *   POST /api/auth/signup  - Register new merchant
 *   POST /api/auth/login   - Login existing merchant
 *
 * Protected Routes (requires JWT):
 *   GET  /api/auth/me      - Get current merchant profile
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// ── Public Routes ─────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);

// ── Protected Routes ──────────────────────────────────────
router.get('/me', authMiddleware, getMe);

module.exports = router;
