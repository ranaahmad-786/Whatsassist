/**
 * WhatsAssist - Live Chat & Takeover Controller
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const whatsappService = require('../services/whatsappService');

function seedDemoForMerchant(merchantId) {
  const merchant = db.findOne('merchants', m => m.id === merchantId) || { business_name: 'WhatsAssist Merchant' };

  // 1. Seed Knowledge Base Document if missing
  const docs = db.findAll('knowledge_documents', d => d.merchant_id === merchantId);
  if (!docs.length) {
    const docId = uuidv4();
    const docText = `${merchant.business_name} is located in Gulberg III, Main Market, Lahore. We provide genuine electronics sales, repair, and customer warranties. Opening Hours: Monday to Saturday 10:00 AM to 10:00 PM. Sunday: 2:00 PM to 10:00 PM. All repair services include a 30-day money-back satisfaction guarantee. Contact support at +92 300 1234567.`;
    db.insert('knowledge_documents', {
      id: docId,
      merchant_id: merchantId,
      file_name: 'store_timings_and_warranty.txt',
      total_chunks: 1,
      status: 'INDEXED',
      raw_text: docText
    });
    db.insert('document_chunks', {
      id: uuidv4(),
      document_id: docId,
      merchant_id: merchantId,
      chunk_text: docText,
      chunk_index: 0
    });
  }

  // 2. Customer 1: Ayesha Khan (AI Active & Answered)
  const cust1 = db.insert('customers', {
    id: uuidv4(),
    merchant_id: merchantId,
    whatsapp_phone: '+923009876543',
    customer_name: 'Ayesha Khan'
  });
  const sess1 = db.insert('conversation_sessions', {
    id: uuidv4(),
    merchant_id: merchantId,
    customer_id: cust1.id,
    session_status: 'AI_ACTIVE',
    sentiment_score: 0.95
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess1.id,
    merchant_id: merchantId,
    sender_type: 'CUSTOMER',
    message_text: 'Assalam o Alaikum! What are your store opening hours on Sunday?',
    created_at: new Date(Date.now() - 3600000).toISOString()
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess1.id,
    merchant_id: merchantId,
    sender_type: 'AI_AGENT',
    message_text: `Walaikum Assalam Ayesha! ${merchant.business_name} is open on Sunday from 2:00 PM to 10:00 PM in Gulberg III Lahore. Let us know if you need any assistance!`,
    ai_confidence_score: 0.96,
    created_at: new Date(Date.now() - 3500000).toISOString()
  });

  // 3. Customer 2: Usman Tariq (Human Takeover)
  const cust2 = db.insert('customers', {
    id: uuidv4(),
    merchant_id: merchantId,
    whatsapp_phone: '+923214567890',
    customer_name: 'Usman Tariq'
  });
  const sess2 = db.insert('conversation_sessions', {
    id: uuidv4(),
    merchant_id: merchantId,
    customer_id: cust2.id,
    session_status: 'HUMAN_TAKEOVER',
    handoff_reason: 'Warranty claim consultation'
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess2.id,
    merchant_id: merchantId,
    sender_type: 'CUSTOMER',
    message_text: 'I got my inverter AC repaired last week, but the cooling stopped again today. Can I claim the 30-day warranty?',
    created_at: new Date(Date.now() - 1800000).toISOString()
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess2.id,
    merchant_id: merchantId,
    sender_type: 'HUMAN_AGENT',
    message_text: `Hello Usman, this is ${merchant.business_name} manager. Absolutely, your service is 100% covered under our 30-day warranty. Our technician will visit tomorrow at 11 AM free of charge.`,
    created_at: new Date(Date.now() - 1200000).toISOString()
  });

  // 4. Customer 3: Dr. Hamza Sheikh (Appointment Lead)
  const cust3 = db.insert('customers', {
    id: uuidv4(),
    merchant_id: merchantId,
    whatsapp_phone: '+923335551234',
    customer_name: 'Dr. Hamza Sheikh'
  });
  const sess3 = db.insert('conversation_sessions', {
    id: uuidv4(),
    merchant_id: merchantId,
    customer_id: cust3.id,
    session_status: 'AI_ACTIVE',
    sentiment_score: 0.8
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess3.id,
    merchant_id: merchantId,
    sender_type: 'CUSTOMER',
    message_text: 'Hi, I need to book a general maintenance appointment for 2 split ACs this Friday.',
    created_at: new Date(Date.now() - 600000).toISOString()
  });
  db.insert('messages', {
    id: uuidv4(),
    session_id: sess3.id,
    merchant_id: merchantId,
    sender_type: 'AI_AGENT',
    message_text: `Hello Dr. Hamza! We have recorded your request to book maintenance for 2 split ACs on Friday. A service manager will confirm your time slot shortly!`,
    ai_confidence_score: 0.92,
    created_at: new Date(Date.now() - 550000).toISOString()
  });
  db.insert('leads', {
    id: uuidv4(),
    merchant_id: merchantId,
    customer_id: cust3.id,
    session_id: sess3.id,
    lead_type: 'APPOINTMENT',
    status: 'NEW',
    extracted_details: JSON.stringify({ service: '2 Split AC Maintenance', date: 'Friday' })
  });
}

const chatController = {
  // GET /api/chats/sessions
  getSessions(req, res) {
    const merchantId = req.merchant.id;
    let sessions = db.findAll('conversation_sessions', s => s.merchant_id === merchantId);

    // Auto-seed demo conversations if merchant currently has 0
    if (sessions.length === 0) {
      seedDemoForMerchant(merchantId);
      sessions = db.findAll('conversation_sessions', s => s.merchant_id === merchantId);
    }

    const enriched = sessions.map(session => {
      const customer = db.findOne('customers', c => c.id === session.customer_id);
      const messages = db.findAll('messages', m => m.session_id === session.id);
      const lastMessage = messages.length ? messages[messages.length - 1] : null;

      return {
        ...session,
        customer_name: customer ? customer.customer_name : 'Customer',
        whatsapp_phone: customer ? customer.whatsapp_phone : '',
        last_message: lastMessage ? lastMessage.message_text : 'No messages yet',
        last_message_time: lastMessage ? lastMessage.created_at : session.initiated_at,
        message_count: messages.length
      };
    }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

    res.json({ success: true, sessions: enriched });
  },

  // GET /api/chats/sessions/:sessionId/messages
  getMessages(req, res) {
    const { sessionId } = req.params;
    const messages = db.findAll('messages', m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json({ success: true, messages });
  },

  // POST /api/chats/sessions/:sessionId/takeover
  toggleTakeover(req, res) {
    const { sessionId } = req.params;
    const session = db.findOne('conversation_sessions', s => s.id === sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const nextStatus = session.session_status === 'HUMAN_TAKEOVER' ? 'AI_ACTIVE' : 'HUMAN_TAKEOVER';
    const updated = db.update('conversation_sessions', sessionId, {
      session_status: nextStatus,
      handoff_reason: nextStatus === 'HUMAN_TAKEOVER' ? 'Manual Merchant Takeover' : null
    });

    res.json({
      success: true,
      message: `Takeover state transitioned to ${nextStatus}`,
      session: updated
    });
  },

  // POST /api/chats/sessions/:sessionId/reply
  async sendHumanReply(req, res) {
    const { sessionId } = req.params;
    const { message_text } = req.body;
    const merchantId = req.merchant.id;

    if (!message_text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const session = db.findOne('conversation_sessions', s => s.id === sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const customer = db.findOne('customers', c => c.id === session.customer_id);

    // Save message as HUMAN_AGENT
    const newMsg = db.insert('messages', {
      id: uuidv4(),
      session_id: sessionId,
      merchant_id: merchantId,
      sender_type: 'HUMAN_AGENT',
      message_text,
      whatsapp_message_id: 'human_' + Date.now(),
      ai_confidence_score: 1.0
    });

    // Send via WhatsApp
    if (customer && customer.whatsapp_phone) {
      await whatsappService.sendMessage(customer.whatsapp_phone, message_text);
    }

    res.json({ success: true, message: newMsg });
  },

  // DELETE /api/chats/sessions/:sessionId/messages (Clear Chat History)
  clearSessionMessages(req, res) {
    const { sessionId } = req.params;
    const deletedCount = db.deleteWhere('messages', m => m.session_id === sessionId);
    res.json({
      success: true,
      message: `Cleared ${deletedCount} messages from conversation`,
      deletedCount
    });
  },

  // DELETE /api/chats/sessions/:sessionId (Delete Entire Conversation Thread)
  deleteSession(req, res) {
    const { sessionId } = req.params;
    db.deleteWhere('messages', m => m.session_id === sessionId);
    db.deleteWhere('leads', l => l.session_id === sessionId);
    const deleted = db.delete('conversation_sessions', sessionId);
    res.json({
      success: true,
      message: 'Chat session deleted successfully',
      deleted
    });
  },

  // DELETE /api/chats/customers/:customerId (Delete Customer and all data)
  deleteCustomer(req, res) {
    const { customerId } = req.params;
    const sessions = db.findAll('conversation_sessions', s => s.customer_id === customerId);
    const sessionIds = sessions.map(s => s.id);

    db.deleteWhere('messages', m => sessionIds.includes(m.session_id));
    db.deleteWhere('leads', l => l.customer_id === customerId);
    db.deleteWhere('conversation_sessions', s => s.customer_id === customerId);
    const deleted = db.delete('customers', customerId);

    res.json({
      success: true,
      message: 'Customer and all associated conversations deleted successfully',
      deleted
    });
  }
};

module.exports = chatController;
