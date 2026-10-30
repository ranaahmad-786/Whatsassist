/**
 * WhatsAssist - Unified WhatsApp Dispatch Service
 * Prioritizes active Baileys WhatsApp Web socket, falls back to Meta Cloud API,
 * or safely records simulated outbound dispatch for development.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const baileysManager = require('./baileysService');

const whatsappService = {
  async sendMessage(to, messageText, config = {}) {
    // 1. Try Baileys WhatsApp Web connection first if active
    if (baileysManager && baileysManager.status === 'CONNECTED') {
      try {
        const baileysRes = await baileysManager.sendMessage(to, messageText);
        if (baileysRes.success && !baileysRes.simulated) {
          console.log(`📱 [WhatsApp Baileys Outbound] Sent to ${to}`);
          return baileysRes;
        }
      } catch (bErr) {
        console.warn('⚠️ [Baileys Dispatch Fallback]:', bErr.message);
      }
    }

    // 2. Try Meta Cloud API if token configured
    const token = config.access_token || process.env.META_ACCESS_TOKEN;
    const phoneId = config.phone_number_id || process.env.META_PHONE_NUMBER_ID;

    if (token && token !== 'your_meta_access_token_here' && phoneId && phoneId !== 'your_meta_phone_number_id_here') {
      try {
        const cleanText = messageText.replace(/<!--[\s\S]*?-->/g, '').trim();
        const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/\D/g, ''),
            type: 'text',
            text: { preview_url: false, body: cleanText }
          })
        });

        const json = await res.json();
        return { success: res.ok, data: json };
      } catch (err) {
        console.error('❌ [Meta Outbound] Dispatch failed:', err.message);
      }
    }

    // 3. Simulated Outbound for Dev & Testing
    console.log(`📱 [Simulated WhatsApp Outbound] To: ${to} | Body: "${messageText.substring(0, 60)}..."`);
    return { success: true, simulated: true, messageId: 'sim_' + Date.now() };
  }
};

module.exports = whatsappService;
