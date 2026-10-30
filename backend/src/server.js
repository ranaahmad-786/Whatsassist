/**
 * WhatsAssist - Express Server Entry Point
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 * @project WhatsAssist - PTUT-PRJ-002
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, verifyDatabaseConnection } = require('./config/database');
const { seedElectronicsData } = require('./config/seedElectronics');

// ── Initialize Database & Seed Catalog ─────────────────────
initializeDatabase();
const dbStatus = verifyDatabaseConnection();
try {
  seedElectronicsData();
} catch (e) {
  console.warn('⚠️ Seeder notice:', e.message);
}

// ── Create Express App ────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ─────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health Check Route ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OPERATIONAL',
    project: 'WhatsAssist',
    version: '1.0.0',
    developer: 'Muhammad Ahmad Khan (24-ST-027)',
    supervisor: 'Dr. Zaigham Mushtaq',
    institution: 'PTUT Lahore',
    timestamp: new Date().toISOString(),
    database: dbStatus.success ? 'CONNECTED' : 'DISCONNECTED'
  });
});

// ── Mount All Routes ──────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/repairs', require('./routes/repairs'));

// ── 404 Handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ [Server Error]:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ── Start Server ──────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║               WhatsAssist Backend Engine               ║');
    console.log('║      PTUT Final Year Project - Muhammad Ahmad Khan     ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  🚀 Server Online:     http://localhost:${PORT}          ║`);
    console.log(`║  🏥 Health Check:      http://localhost:${PORT}/api/health ║`);
    console.log(`║  📱 WhatsApp Web Hub:  http://localhost:${PORT}/api/whatsapp/status ║`);
    console.log(`║  🗄️  Database Store:   Verified Relational Multi-Tenant║`);
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  });
}

module.exports = app;
