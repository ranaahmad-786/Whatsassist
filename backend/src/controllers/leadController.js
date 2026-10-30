/**
 * WhatsAssist - CRM Leads Controller
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');

const leadController = {
  // GET /api/leads
  getLeads(req, res) {
    const merchantId = req.merchant.id;
    const leads = db.findAll('leads', l => l.merchant_id === merchantId);

    const enriched = leads.map(lead => {
      const customer = db.findOne('customers', c => c.id === lead.customer_id);
      return {
        ...lead,
        customer_name: customer ? customer.customer_name : 'Unknown Contact',
        whatsapp_phone: customer ? customer.whatsapp_phone : 'N/A'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, leads: enriched });
  },

  // PUT /api/leads/:id
  updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const merchantId = req.merchant.id;

    const allowed = ['NEW', 'CONTACTED', 'CONVERTED', 'DISQUALIFIED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid lead status' });
    }

    const lead = db.findOne('leads', l => l.id === id && l.merchant_id === merchantId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updated = db.update('leads', id, { status });
    res.json({ success: true, message: `Lead updated to ${status}`, lead: updated });
  }
};

module.exports = leadController;
