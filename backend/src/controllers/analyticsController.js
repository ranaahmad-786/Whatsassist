/**
 * WhatsAssist - Analytics & Telemetry Controller
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

const { db } = require('../config/database');

const analyticsController = {
  // GET /api/analytics/overview
  getOverview(req, res) {
    const merchantId = req.merchant.id;

    const sessions = db.findAll('conversation_sessions', s => s.merchant_id === merchantId);
    const messages = db.findAll('messages', m => m.merchant_id === merchantId);
    const leads = db.findAll('leads', l => l.merchant_id === merchantId);
    const documents = db.findAll('knowledge_documents', d => d.merchant_id === merchantId);
    const products = db.findAll('products', p => p.merchant_id === merchantId);
    const orders = db.findAll('orders', o => o.merchant_id === merchantId);
    const repairs = db.findAll('repairs', r => r.merchant_id === merchantId);

    const totalSessions = sessions.length;
    const humanEscalated = sessions.filter(s => s.session_status === 'HUMAN_TAKEOVER').length;
    const aiResolved = totalSessions - humanEscalated;
    const resolutionRate = totalSessions > 0 ? Math.round((aiResolved / totalSessions) * 100) : 100;

    const totalMessages = messages.length;
    const totalLeads = leads.length;
    const totalDocs = documents.length;

    // Financial & E-commerce Metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Inventory Metrics
    const lowStockItems = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 3);
    const outOfStockItems = products.filter(p => p.stock_quantity <= 0);

    // Top Inquired Products for Charts
    const topInquiredProducts = [...products]
      .sort((a, b) => (b.inquiry_count || 0) - (a.inquiry_count || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title,
        full_title: p.title,
        category: p.category,
        price: p.price,
        inquiries: p.inquiry_count || 0,
        stock: p.stock_quantity
      }));

    res.json({
      success: true,
      data: {
        total_sessions: totalSessions,
        ai_resolved: aiResolved,
        human_escalated: humanEscalated,
        resolution_rate: resolutionRate,
        total_messages: totalMessages,
        total_leads: totalLeads,
        total_documents: totalDocs,
        total_products: products.length,
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        avg_order_value: avgOrderValue,
        low_stock_count: lowStockItems.length,
        out_of_stock_count: outOfStockItems.length,
        low_stock_items: lowStockItems.map(p => ({ id: p.id, title: p.title, stock: p.stock_quantity })),
        top_inquired_products: topInquiredProducts,
        active_repairs_count: repairs.filter(r => r.status !== 'DELIVERED').length,
        system_status: {
          webhook: 'ACTIVE',
          database: 'CONNECTED',
          ai_model: 'Gemini-1.5-Flash (Ready)',
          catalog_status: `${products.length} Items Live`
        }
      }
    });
  }
};

module.exports = analyticsController;
