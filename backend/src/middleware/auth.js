/**
 * WhatsAssist - JWT Auth Middleware
 * Protects routes by verifying the Bearer JWT token.
 * Attaches decoded merchant payload to req.merchant on success.
 *
 * Usage: router.get('/protected', authMiddleware, handler)
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // ── Extract token from Authorization header ───────────
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Use Authorization: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    // ── Verify and decode JWT ─────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach merchant payload to request for downstream use
    req.merchant = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authentication failed.',
      });
    }
    console.error('❌ [AuthMiddleware] Unexpected error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = authMiddleware;
