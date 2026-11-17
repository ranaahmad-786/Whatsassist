/**
 * WhatsAssist - CRM Leads Controller
 * Enriches WhatsApp and Storefront leads with complete customer identity, order details & status.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');

const leadController = {
  // GET /api/leads
  getLeads(req, res) {
    const merchantId = req.merchant.id;
    let leads = db.findAll('leads', l => l.merchant_id === merchantId);

    if (!leads || leads.length === 0) {
      leads = db.findAll('leads'); // Fallback if single-store
    }

    const enriched = leads.map(lead => {
      let customerName = lead.customer_name;
      let whatsappPhone = lead.whatsapp_phone;

      // 1. Try to extract from extracted_details JSON
      let detailsObj = null;
      if (lead.extracted_details) {
        try {
          detailsObj = typeof lead.extracted_details === 'string'
            ? JSON.parse(lead.extracted_details)
            : lead.extracted_details;
        } catch (e) {}
      }

      // 2. If lead is from an order, lookup matching order in orders table
      if (detailsObj && detailsObj.order_code) {
        const order = db.findOne('orders', o => o.order_code === detailsObj.order_code);
        if (order) {
          if (!customerName || customerName === 'Unknown Contact' || customerName === 'WhatsApp Customer') {
            customerName = order.customer_name;
          }
          if (!whatsappPhone || whatsappPhone === 'N/A') {
            whatsappPhone = order.customer_phone;
          }
        }
      }

      // 3. Check direct phone / customer_name in detailsObj
      if (detailsObj) {
        if ((!customerName || customerName === 'Unknown Contact') && detailsObj.customer_name) {
          customerName = detailsObj.customer_name;
        }
        if ((!whatsappPhone || whatsappPhone === 'N/A') && (detailsObj.phone || detailsObj.customer_phone)) {
          whatsappPhone = detailsObj.phone || detailsObj.customer_phone;
        }
      }

      // 4. Check customers table
      if (!customerName || customerName === 'Unknown Contact' || !whatsappPhone || whatsappPhone === 'N/A') {
        const customer = db.findOne('customers', c => c.id === lead.customer_id);
        if (customer) {
          if (!customerName || customerName === 'Unknown Contact') customerName = customer.customer_name;
          if (!whatsappPhone || whatsappPhone === 'N/A') whatsappPhone = customer.whatsapp_phone;
        }
      }

      // 5. Check merchants table (for logged-in customer portal users)
      if (!customerName || customerName === 'Unknown Contact' || !whatsappPhone || whatsappPhone === 'N/A') {
        const user = db.findOne('merchants', m => m.id === lead.customer_id);
        if (user) {
          if (!customerName || customerName === 'Unknown Contact') {
            customerName = user.name || user.business_name || (user.email ? user.email.split('@')[0] : null);
          }
          if (!whatsappPhone || whatsappPhone === 'N/A') {
            whatsappPhone = user.phone || user.whatsapp_phone;
          }
        }
      }

      // 6. Check conversation_sessions table
      if (!customerName || customerName === 'Unknown Contact' || !whatsappPhone || whatsappPhone === 'N/A') {
        if (lead.session_id) {
          const sess = db.findOne('conversation_sessions', s => s.id === lead.session_id);
          if (sess) {
            const sessCust = db.findOne('customers', c => c.id === sess.customer_id);
            if (sessCust) {
              if (!customerName || customerName === 'Unknown Contact') customerName = sessCust.customer_name;
              if (!whatsappPhone || whatsappPhone === 'N/A') whatsappPhone = sessCust.whatsapp_phone;
            }
          }
        }
      }

      // 7. Clean fallbacks
      if (!customerName || customerName === 'Unknown Contact' || customerName.trim() === '') {
        customerName = 'Valued Customer';
      }
      if (!whatsappPhone || whatsappPhone === 'N/A' || whatsappPhone.trim() === '') {
        whatsappPhone = '+92 331 4228724';
      }

      return {
        ...lead,
        customer_name: customerName,
        whatsapp_phone: whatsappPhone
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, leads: enriched });
  },

  // PUT /api/leads/:id
  updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const merchantId = req.merchant.id;

    const allowed = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid lead status' });
    }

    const lead = db.findOne('leads', l => l.id === id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updated = db.update('leads', id, { status });
    res.json({ success: true, message: `Lead updated to ${status}`, lead: updated });
  }
};

module.exports = leadController;
