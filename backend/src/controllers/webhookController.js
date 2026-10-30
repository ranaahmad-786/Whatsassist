/**
 * WhatsAssist - WhatsApp Webhook Controller
 * Handles Meta Cloud API challenge verification & inbound message pipeline.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const ragService = require('../services/ragService');
const geminiService = require('../services/geminiService');
const whatsappService = require('../services/whatsappService');

const webhookController = {
  // GET: Meta verification handshake
  verify(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'whatsassist_webhook_verify_2024';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ [Webhook] Meta verification handshake succeeded.');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification token mismatch' });
  },

  // POST: Live inbound message event
  async handleIncoming(req, res) {
    try {
      const body = req.body;

      if (!body.object || !body.entry || !body.entry[0]?.changes) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const value = body.entry[0].changes[0]?.value;
      if (!value || !value.messages || !value.messages[0]) {
        return res.status(200).send('EVENT_RECEIVED');
      }

      const incomingMsg = value.messages[0];
      const customerPhone = incomingMsg.from;
      const messageText = incomingMsg.text ? incomingMsg.text.body : '';
      const customerName = value.contacts && value.contacts[0]?.profile?.name ? value.contacts[0].profile.name : 'WhatsApp Customer';

      // Pick target merchant: check if merchant_id passed in body, or select active ZepTech merchant
      const merchants = db.findAll('merchants');
      const merchant = (req.body.merchant_id && db.findOne('merchants', m => m.id === req.body.merchant_id)) 
        || db.findOne('merchants', m => m.email === 'ranaahmadkhan.112211@gmail.com')
        || db.findOne('merchants', m => m.business_name === 'ZepTech')
        || (merchants.length ? merchants[merchants.length - 1] : { id: 'default_merchant', business_name: 'ZepTech' });

      // 1. Resolve or create customer
      let customer = db.findOne('customers', c => c.whatsapp_phone === customerPhone && c.merchant_id === merchant.id);
      if (!customer) {
        customer = db.insert('customers', {
          id: uuidv4(),
          merchant_id: merchant.id,
          whatsapp_phone: customerPhone,
          customer_name: customerName,
          first_seen_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        });
      } else {
        db.update('customers', customer.id, { last_active_at: new Date().toISOString() });
      }

      // 2. Resolve or create active session
      let session = db.findOne('conversation_sessions', s => s.customer_id === customer.id && s.merchant_id === merchant.id && s.session_status !== 'RESOLVED');
      if (!session) {
        session = db.insert('conversation_sessions', {
          id: uuidv4(),
          merchant_id: merchant.id,
          customer_id: customer.id,
          session_status: 'AI_ACTIVE',
          sentiment_score: 0.5,
          handoff_reason: null
        });
      }

      // 3. Save incoming customer message
      db.insert('messages', {
        id: uuidv4(),
        session_id: session.id,
        merchant_id: merchant.id,
        sender_type: 'CUSTOMER',
        message_text: messageText,
        whatsapp_message_id: incomingMsg.id,
        ai_confidence_score: null
      });

      // 4. Check for automated lead intent (booking, order, inquiry)
      const leadKeywords = ['book', 'appointment', 'price', 'order', 'quote', 'buy', 'contact', 'service'];
      const hasLeadIntent = leadKeywords.some(k => messageText.toLowerCase().includes(k));
      if (hasLeadIntent) {
        const existingLead = db.findOne('leads', l => l.customer_id === customer.id && l.status === 'NEW');
        if (!existingLead) {
          db.insert('leads', {
            id: uuidv4(),
            merchant_id: merchant.id,
            customer_id: customer.id,
            session_id: session.id,
            lead_type: messageText.toLowerCase().includes('book') ? 'APPOINTMENT' : 'INQUIRY',
            status: 'NEW',
            extracted_details: JSON.stringify({ query: messageText, detected_at: new Date().toISOString() })
          });
        }
      }

      // 5. If Human Takeover is engaged, skip AI response
      if (session.session_status === 'HUMAN_TAKEOVER') {
        return res.status(200).json({ status: 'HUMAN_HANDOFF_ACTIVE' });
      }

      // 6. Execute RAG Retrieval & Intelligent Answer Generation
      const ragResult = ragService.retrieveContext(merchant.id, messageText);
      const confidence = ragResult.confidence;
      let replyText = await geminiService.generateAnswer(merchant.business_name, ragResult.context, messageText, customerPhone, customerName);
      if (!replyText || !replyText.trim()) {
        replyText = `Hello ${customerName}! Thank you for messaging ${merchant.business_name}. We provide sales, maintenance, and warranty support. How may we help you?`;
      }

      // 7. Dispatch Outbound reply via WhatsApp
      await whatsappService.sendMessage(customerPhone, replyText);

      // 8. Persist Outbound message
      db.insert('messages', {
        id: uuidv4(),
        session_id: session.id,
        merchant_id: merchant.id,
        sender_type: 'AI_AGENT',
        message_text: replyText,
        whatsapp_message_id: 'out_' + Date.now(),
        ai_confidence_score: confidence
      });

      return res.status(200).json({ status: 'PROCESSED', reply: replyText });
    } catch (err) {
      console.error('❌ [Webhook] Processing error:', err.message);
      return res.status(200).send('ERROR_HANDLED');
    }
  }
};

module.exports = webhookController;
