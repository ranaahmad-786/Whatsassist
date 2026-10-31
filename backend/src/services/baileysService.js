/**
 * WhatsAssist - Baileys WhatsApp Web Multi-Device Service
 * Direct WhatsApp Web connectivity via QR Code & Pairing Code.
 * Listens for real WhatsApp messages, runs Gemini AI + RAG + Order/Repair resolution,
 * and replies automatically via WhatsApp.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 * @project WhatsAssist - PTUT Final Year Project
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const geminiService = require('./geminiService');

const AUTH_DIR = path.resolve(__dirname, '../../data/baileys_auth');

class BaileysManager {
  constructor() {
    this.sock = null;
    this.status = 'DISCONNECTED'; // DISCONNECTED | INITIALIZING | QR_READY | PAIRING | CONNECTED | ERROR
    this.qr = null;
    this.qrDataUrl = null;
    this.pairingCode = null;
    this.user = null;
    this.logs = [];
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      aiReplies: 0,
      startedAt: new Date().toISOString(),
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
  }

  log(message, type = 'info') {
    const entry = {
      id: uuidv4(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      type,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 30) this.logs.pop();
    console.log(`📱 [Baileys ${type.toUpperCase()}] ${message}`);
  }

  getStatus() {
    return {
      status: this.status,
      isConnected: this.status === 'CONNECTED',
      qr: this.qr,
      qrDataUrl: this.qrDataUrl,
      pairingCode: this.pairingCode,
      user: this.user,
      stats: this.stats,
      logs: this.logs.slice(0, 15),
    };
  }

  async init(requestPairingPhone = null) {
    if (this.isConnecting) {
      this.log('Connection attempt already in progress, skipping duplicate init', 'warn');
      return this.getStatus();
    }

    try {
      this.isConnecting = true;
      this.status = 'INITIALIZING';
      this.log('Initializing Baileys WhatsApp multi-device engine...');

      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      let version;
      try {
        const vInfo = await fetchLatestBaileysVersion();
        version = vInfo.version;
      } catch (e) {
        version = [2, 3000, 1015901307]; // fallback stable version
      }

      const logger = pino({ level: 'silent' });

      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['WhatsAssist Web', 'Chrome', '124.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
      });

      // Save credentials whenever updated
      this.sock.ev.on('creds.update', saveCreds);

      // Handle pairing code if requested
      if (requestPairingPhone && !state.creds.registered) {
        setTimeout(async () => {
          try {
            const cleanPhone = requestPairingPhone.replace(/\D/g, '');
            this.log(`Requesting pairing code for phone: +${cleanPhone}`);
            const code = await this.sock.requestPairingCode(cleanPhone);
            this.pairingCode = code;
            this.status = 'PAIRING';
            this.log(`Pairing code generated: ${code}`, 'success');
          } catch (pairErr) {
            this.log(`Failed to generate pairing code: ${pairErr.message}`, 'error');
          }
        }, 3000);
      }

      // Connection state updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qr = qr;
          this.status = 'QR_READY';
          try {
            this.qrDataUrl = await qrcode.toDataURL(qr, {
              margin: 2,
              scale: 8,
              color: { dark: '#020617', light: '#ffffff' },
            });
            this.log('Fresh WhatsApp Web QR Code generated — ready for scan in dashboard', 'success');
          } catch (qrErr) {
            console.error('Failed to encode QR DataURL:', qrErr.message);
          }
        }

        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          this.status = 'DISCONNECTED';
          this.qr = null;
          this.qrDataUrl = null;
          this.user = null;
          this.log(`WhatsApp connection closed (Status code: ${statusCode || 'unknown'}). Should reconnect: ${shouldReconnect}`, 'warn');

          if (statusCode === DisconnectReason.loggedOut) {
            this.log('WhatsApp account logged out. Clearing stored credentials.', 'warn');
            this.clearAuthFiles();
          } else if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`Reconnecting WhatsApp attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => {
              this.isConnecting = false;
              this.init();
            }, 5000);
          } else {
            this.isConnecting = false;
          }
        } else if (connection === 'open') {
          this.reconnectAttempts = 0;
          this.status = 'CONNECTED';
          this.qr = null;
          this.qrDataUrl = null;
          this.pairingCode = null;

          const userInfo = this.sock.user || {};
          const rawId = userInfo.id || '';
          const phone = rawId.split(':')[0] || rawId.split('@')[0];

          this.user = {
            id: rawId,
            phone: phone.startsWith('+') ? phone : `+${phone}`,
            name: userInfo.name || 'WhatsAssist Merchant Device',
            platform: 'WhatsApp Multi-Device Web',
            connectedAt: new Date().toISOString(),
          };

          this.log(`✅ WhatsApp successfully LINKED & ONLINE for ${this.user.phone} (${this.user.name})`, 'success');
        }
      });

      // Inbound Messages Listener
      this.sock.ev.on('messages.upsert', async ({ messages: newMessages, type }) => {
        if (type !== 'notify') return;

        for (const msg of newMessages) {
          try {
            if (!msg.message || msg.key.fromMe) continue; // ignore outgoing messages

            const remoteJid = msg.key.remoteJid;
            if (!remoteJid || remoteJid.endsWith('@broadcast') || remoteJid.includes('@g.us')) {
              continue; // ignore status broadcasts or group messages
            }

            // Extract text message content
            const text =
              msg.message.conversation ||
              msg.message.extendedTextMessage?.text ||
              msg.message.imageMessage?.caption ||
              msg.message.videoMessage?.caption ||
              '';

            if (!text.trim()) continue;

            const senderPhone = '+' + remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
            const senderName = msg.pushName || 'WhatsApp Customer';

            this.stats.messagesReceived++;
            this.log(`📨 Inbound WhatsApp from ${senderName} (${senderPhone}): "${text}"`);

            // Process message through WhatsAssist Intelligent Engine
            await this.processInboundMessage({
              remoteJid,
              senderPhone,
              senderName,
              text,
              messageId: msg.key.id,
            });
          } catch (msgErr) {
            this.log(`Error processing incoming message: ${msgErr.message}`, 'error');
          }
        }
      });

      this.isConnecting = false;
      return this.getStatus();
    } catch (err) {
      this.isConnecting = false;
      this.status = 'ERROR';
      this.log(`Initialization error: ${err.message}`, 'error');
      return this.getStatus();
    }
  }

  async processInboundMessage({ remoteJid, senderPhone, senderName, text, messageId }) {
    // 1. Resolve target merchant (ZepTech)
    const merchants = db.findAll('merchants');
    const merchant =
      db.findOne('merchants', (m) => m.email === 'ranaahmadkhan.112211@gmail.com') ||
      db.findOne('merchants', (m) => m.business_name === 'ZepTech') ||
      (merchants.length ? merchants[0] : { id: 'default_merchant', business_name: 'ZepTech' });

    // 2. Resolve or create customer in database
    let customer = db.findOne('customers', (c) => c.whatsapp_phone === senderPhone && c.merchant_id === merchant.id);
    if (!customer) {
      customer = db.insert('customers', {
        id: uuidv4(),
        merchant_id: merchant.id,
        whatsapp_phone: senderPhone,
        customer_name: senderName,
        first_seen_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });
    } else {
      db.update('customers', customer.id, {
        customer_name: senderName !== 'WhatsApp Customer' ? senderName : customer.customer_name,
        last_active_at: new Date().toISOString(),
      });
    }

    // 3. Resolve or create active conversation session
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
        sentiment_score: 0.5,
        handoff_reason: null,
      });
    }

    // 4. Save incoming customer message
    db.insert('messages', {
      id: uuidv4(),
      session_id: session.id,
      merchant_id: merchant.id,
      sender_type: 'CUSTOMER',
      message_text: text,
      whatsapp_message_id: messageId,
      ai_confidence_score: null,
    });

    // 5. If Human Takeover is active, do not auto-respond with AI
    if (session.session_status === 'HUMAN_TAKEOVER') {
      this.log(`Session ${session.id} is in HUMAN_TAKEOVER mode. Awaiting merchant manual reply.`);
      return;
    }

    // 6. Generate AI response using Gemini + Knowledge RAG + Catalog & Repair rules
    const businessName = merchant.business_name || 'ZepTech Smart Electronics';
    this.log(`Generating AI answer for "${text}" via Gemini AI Orchestrator...`);

    const aiRawReply = await geminiService.generateAnswer(businessName, '', text, senderPhone, senderName, merchant.id);

    // 7. Format clean text for WhatsApp outbound (strip HTML comments if any)
    const cleanOutboundText = aiRawReply
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    // 8. Save AI reply in database
    db.insert('messages', {
      id: uuidv4(),
      session_id: session.id,
      merchant_id: merchant.id,
      sender_type: 'AI_AGENT',
      message_text: aiRawReply,
      whatsapp_message_id: 'baileys_ai_' + Date.now(),
      ai_confidence_score: 0.96,
    });

    this.stats.aiReplies++;

    // 9. Send response back to customer on WhatsApp
    if (this.sock && this.status === 'CONNECTED') {
      await this.sock.sendMessage(remoteJid, { text: cleanOutboundText });
      this.stats.messagesSent++;
      this.log(`📤 Dispatched AI answer back to WhatsApp user ${senderPhone}`, 'success');
    } else {
      this.log(`Outbound message logged in DB (WhatsApp socket not currently connected for auto-dispatch)`, 'info');
    }
  }

  async sendMessage(toPhone, messageText) {
    const cleanText = messageText.replace(/<!--[\s\S]*?-->/g, '').trim();

    // Format phone to WhatsApp JID: e.g. 923314228724@s.whatsapp.net
    let digits = toPhone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    const jid = `${digits}@s.whatsapp.net`;

    if (this.sock && this.status === 'CONNECTED') {
      try {
        const res = await this.sock.sendMessage(jid, { text: cleanText });
        this.stats.messagesSent++;
        this.log(`✅ Direct WhatsApp message dispatched to ${toPhone}`, 'success');
        return { success: true, messageId: res.key?.id, jid };
      } catch (err) {
        this.log(`Failed to send message to ${toPhone}: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    }

    this.log(`WhatsApp socket offline; logged outbound message to ${toPhone}`, 'warn');
    return { success: true, simulated: true, note: 'WhatsApp socket offline, message recorded' };
  }

  async disconnect(clearAuth = false) {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
        this.sock.end(undefined);
        this.sock = null;
      }
      this.status = 'DISCONNECTED';
      this.qr = null;
      this.qrDataUrl = null;
      this.pairingCode = null;
      this.user = null;

      if (clearAuth) {
        this.clearAuthFiles();
        this.log('Cleared Baileys authentication files.');
      }

      this.log('WhatsApp connection closed.');
      return { success: true };
    } catch (err) {
      this.log(`Disconnect error: ${err.message}`, 'error');
      return { success: false, error: err.message };
    }
  }

  clearAuthFiles() {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('Error clearing auth directory:', e.message);
    }
  }
}

const baileysManager = new BaileysManager();
module.exports = baileysManager;
