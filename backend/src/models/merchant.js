/**
 * WhatsAssist - User & Merchant Model (Multi-Tenant & Role-Based Access)
 * Supports Customer, Store Owner, Store Manager, and Administrator accounts.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Merchant = {
  create(data) {
    const id = uuidv4();
    const role = data.role || 'owner';
    const isCustomer = role === 'customer';

    const merchant = db.insert('merchants', {
      id,
      business_name: data.business_name || (isCustomer ? (data.name || 'Customer') : 'ZepTech'),
      name: data.name || data.business_name || 'User',
      email: data.email.toLowerCase().trim(),
      password_hash: data.password_hash,
      phone_number: data.phone_number || null,
      business_category: isCustomer ? 'Customer' : (data.business_category || 'Electronics & Household Appliances'),
      role: role,
      is_active: 1
    });

    // Provision corresponding WhatsApp config if business account
    if (!isCustomer) {
      db.insert('whatsapp_configs', {
        id: uuidv4(),
        merchant_id: id,
        phone_number_id: 'PHONE_' + id.substring(0, 8),
        waba_id: 'WABA_' + id.substring(0, 8),
        webhook_verify_token: 'verify_' + id.substring(0, 8),
        fallback_threshold: 0.65,
        is_active: 1
      });
    }

    return merchant;
  },

  findById(id) {
    return db.findOne('merchants', m => m.id === id);
  },

  findByEmail(email) {
    if (!email) return null;
    return db.findOne('merchants', m => m.email.toLowerCase() === email.toLowerCase());
  },

  emailExists(email) {
    return !!this.findByEmail(email);
  },

  sanitize(merchant) {
    if (!merchant) return null;
    const { password_hash, ...safe } = merchant;
    return safe;
  },

  touchUpdatedAt(id) {
    db.update('merchants', id, { updated_at: new Date().toISOString() });
  }
};

module.exports = Merchant;
