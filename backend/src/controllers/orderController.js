/**
 * WhatsAssist - WhatsApp Orders Controller
 * Handles conversational order creation, status management, and sales totals.
 * Synchronizes orders between Customer Shopper view and Store Owner Dashboard.
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

const orderController = {
  // GET /api/orders
  getAll(req, res) {
    const storeId = resolveStoreId(req);
    const isCustomer = req.merchant?.role === 'customer';

    // Store Owner sees ALL store orders; Customer sees store orders (filtered to theirs if present)
    let orders = db.findAll('orders', o => o.merchant_id === storeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (isCustomer && req.merchant) {
      const custPhone = req.merchant.phone_number ? req.merchant.phone_number.replace(/\D/g, '').slice(-7) : '';
      const custName = (req.merchant.name || req.merchant.business_name || '').toLowerCase();
      
      const myOrders = orders.filter(o =>
        (o.customer_id && o.customer_id === req.merchant.id) ||
        (custPhone && o.customer_phone && o.customer_phone.replace(/\D/g, '').includes(custPhone)) ||
        (custName && o.customer_name && o.customer_name.toLowerCase().includes(custName))
      );

      // If customer has placed specific orders, show theirs; otherwise show store demonstration orders
      if (myOrders.length > 0) {
        orders = myOrders;
      }
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.order_status === 'CONFIRMED' || o.order_status === 'PENDING').length;
    const deliveredOrders = orders.filter(o => o.order_status === 'DELIVERED').length;

    res.json({
      success: true,
      orders,
      summary: {
        total_orders: orders.length,
        total_revenue: totalRevenue,
        pending_orders: pendingOrders,
        delivered_orders: deliveredOrders
      }
    });
  },

  // POST /api/orders
  create(req, res) {
    const storeId = resolveStoreId(req);
    const isCustomer = req.merchant?.role === 'customer';
    const { customer_name, customer_phone, delivery_address, items, total_amount, payment_method } = req.body;

    const finalName = customer_name || (isCustomer ? req.merchant.name : 'Customer');
    const finalPhone = customer_phone || (isCustomer ? req.merchant.phone_number : '+92 331 4228724');

    if (!finalName || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name and items are required' });
    }

    const orderCode = `ZP-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Decrement stock for purchased item
    items.forEach(it => {
      const prod = db.findOne('products', p => p.title.toLowerCase() === it.title.toLowerCase());
      if (prod && prod.stock_quantity > 0) {
        db.update('products', prod.id, { stock_quantity: Math.max(0, prod.stock_quantity - (it.quantity || 1)) });
      }
    });

    const newOrder = db.insert('orders', {
      id: uuidv4(),
      order_code: orderCode,
      merchant_id: storeId, // Saved under Store ID so it appears in Store Owner Dashboard!
      customer_id: isCustomer ? req.merchant.id : null,
      customer_name: finalName,
      customer_phone: finalPhone,
      delivery_address: delivery_address || 'Gulberg III, Lahore',
      items,
      total_amount: Number(total_amount || 0),
      order_status: 'CONFIRMED',
      payment_method: payment_method || 'Cash on Delivery (COD)'
    });

    // Also record lead for CRM
    db.insert('leads', {
      id: uuidv4(),
      merchant_id: storeId,
      customer_id: isCustomer ? req.merchant.id : 'cust_direct',
      session_id: 'portal_order',
      lead_type: 'ORDER_PLACED',
      status: 'QUALIFIED',
      extracted_details: JSON.stringify({ order_code: orderCode, items: items.map(i => i.title), amount: total_amount })
    });

    res.status(201).json({ success: true, order: newOrder, message: 'Order created successfully' });
  },

  // PUT /api/orders/:id/status
  updateStatus(req, res) {
    const { id } = req.params;
    const { order_status } = req.body;

    const existing = db.findOne('orders', o => o.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updated = db.update('orders', id, { order_status });
    res.json({ success: true, order: updated, message: `Order status changed to ${order_status}` });
  },

  // DELETE /api/orders/:id
  delete(req, res) {
    if (req.merchant?.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Only store managers can delete orders' });
    }
    const { id } = req.params;
    const existing = db.findOne('orders', o => o.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    db.delete('orders', id);
    res.json({ success: true, message: 'Order record deleted' });
  }
};

module.exports = orderController;
