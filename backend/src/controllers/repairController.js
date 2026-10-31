/**
 * WhatsAssist - Repair & Warranty Token Tracking Controller
 * Customers track electronics repair status by token (e.g. REP-101).
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function resolveStoreId(req) {
  if (req.merchant && req.merchant.role !== 'customer') {
    return req.merchant.id;
  }
  const store = db.findOne('merchants', m => m.role === 'owner' || m.role === 'admin') || db.findOne('merchants');
  return store ? store.id : (req.merchant?.id || '1c8b9736-ad03-4251-bacf-1e1bff38fd00');
}

const repairController = {
  // GET /api/repairs
  getAll(req, res) {
    const storeId = resolveStoreId(req);
    const repairs = db.findAll('repairs', r => r.merchant_id === storeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, repairs });
  },

  // GET /api/repairs/track/:token (Public or in-app token lookup)
  trackByToken(req, res) {
    const token = req.params.token.toUpperCase().trim();
    const repair = db.findOne('repairs', r => r.token_number.toUpperCase() === token);

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: `No active repair record found for token "${token}". Please double-check your receipt token number.`
      });
    }

    res.json({ success: true, repair });
  },

  // POST /api/repairs (Store Owner Only)
  create(req, res) {
    if (req.merchant?.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Only store managers can create repair tickets' });
    }
    const storeId = resolveStoreId(req);
    const { customer_name, customer_phone, item_name, issue_reported, estimated_cost, warranty_days, technician_notes } = req.body;

    if (!customer_name || !item_name || !issue_reported) {
      return res.status(400).json({ success: false, message: 'Customer name, item, and issue are required' });
    }

    // Auto-generate Token e.g. REP-104
    const existing = db.findAll('repairs');
    const tokenNumber = `REP-${100 + existing.length + 1}`;

    const newRepair = db.insert('repairs', {
      id: uuidv4(),
      token_number: tokenNumber,
      merchant_id: storeId,
      customer_name,
      customer_phone: customer_phone || '+923314228724',
      item_name,
      issue_reported,
      status: 'RECEIVED',
      estimated_cost: Number(estimated_cost || 0),
      warranty_days: Number(warranty_days || 30),
      technician_notes: technician_notes || 'Device received at front desk. Awaiting bench diagnostics.'
    });

    res.status(201).json({ success: true, repair: newRepair, message: `Repair ticket ${tokenNumber} registered` });
  },

  // PUT /api/repairs/:id
  update(req, res) {
    const { id } = req.params;
    const storeId = resolveStoreId(req);

    const existing = db.findOne('repairs', r => r.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Repair record not found' });
    }

    const updated = db.update('repairs', id, { ...req.body });
    res.json({ success: true, repair: updated, message: 'Repair ticket updated' });
  },

  // DELETE /api/repairs/:id
  delete(req, res) {
    if (req.merchant?.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Only store managers can delete repair tickets' });
    }
    const { id } = req.params;
    const existing = db.findOne('repairs', r => r.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Repair record not found' });
    }

    db.delete('repairs', id);
    res.json({ success: true, message: 'Repair record deleted' });
  }
};

module.exports = repairController;
