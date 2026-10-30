/**
 * WhatsAssist - WhatsApp & Baileys Management Routes
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const express = require('express');
const router = express.Router();
const baileysManager = require('../services/baileysService');
const geminiService = require('../services/geminiService');
const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// GET /api/whatsapp/status
router.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: baileysManager.getStatus(),
  });
});

// POST /api/whatsapp/connect
router.post('/connect', async (_req, res) => {
  try {
    const status = await baileysManager.init();
    res.json({
      success: true,
      message: 'WhatsApp connection initiated',
      data: status,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/pair
router.post('/pair', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const status = await baileysManager.init(phone);
    res.json({
      success: true,
      message: 'Pairing requested',
      data: status,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', async (req, res) => {
  try {
    const { clearAuth } = req.body || {};
    const result = await baileysManager.disconnect(Boolean(clearAuth));
    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/send
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Recipient (to) and message are required' });
    }
    const result = await baileysManager.sendMessage(to, message);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/simulate (Instant Interactive Browser Simulator)
router.post('/simulate', async (req, res) => {
  try {
    const { name = 'Simulated Customer', phone = '+923001234567', message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const merchants = db.findAll('merchants');
    const merchant =
      db.findOne('merchants', (m) => m.email === 'ranaahmadkhan.112211@gmail.com') ||
      db.findOne('merchants', (m) => m.business_name === 'ZepTech') ||
      (merchants.length ? merchants[0] : { id: 'default_merchant', business_name: 'ZepTech' });

    // 1. Resolve or create customer
    let customer = db.findOne('customers', (c) => c.whatsapp_phone === phone && c.merchant_id === merchant.id);
    if (!customer) {
      customer = db.insert('customers', {
        id: uuidv4(),
        merchant_id: merchant.id,
        whatsapp_phone: phone,
        customer_name: name,
        first_seen_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });
    } else {
      db.update('customers', customer.id, {
        customer_name: name !== 'Simulated Customer' ? name : customer.customer_name,
        last_active_at: new Date().toISOString(),
      });
    }

    // 2. Resolve or create active session
    let session = db.findOne(
      'conversation_sessions',
      (s) => s.customer_id === customer.id && s.merchant_id === merchant.id && s.session_status !== 'RESOLVED'
    );
    if (!session) {
      session = db.insert('conversation_sessions', {
        id: uuidv4(),
        merchant_id: merchant.id,
        customer_id: customer.id,
        session_status: 'AI_ACTIVE',
        sentiment_score: 0.85,
        handoff_reason: null,
      });
    }

    // 3. Save incoming customer message
    const custMsg = db.insert('messages', {
      id: uuidv4(),
      session_id: session.id,
      merchant_id: merchant.id,
      sender_type: 'CUSTOMER',
      message_text: message,
      whatsapp_message_id: 'sim_in_' + Date.now(),
      ai_confidence_score: null,
    });

    let aiMsg = null;
    if (session.session_status === 'HUMAN_TAKEOVER') {
      return res.json({
        success: true,
        takeover: true,
        message: 'Session is in Human Takeover mode. Message queued for merchant reply.',
        customerMessage: custMsg,
        session,
      });
    }

    // 4. Generate AI reply
    const aiAnswer = await geminiService.generateAnswer(merchant.business_name || 'ZepTech', '', message, phone, name, merchant.id);

    aiMsg = db.insert('messages', {
      id: uuidv4(),
      session_id: session.id,
      merchant_id: merchant.id,
      sender_type: 'AI_AGENT',
      message_text: aiAnswer,
      whatsapp_message_id: 'sim_out_' + Date.now(),
      ai_confidence_score: 0.97,
    });

    res.json({
      success: true,
      session,
      customerMessage: custMsg,
      aiMessage: aiMsg,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
