/**
 * WhatsAssist - Product Catalog Controller
 * Full CRUD, stock level tracking, and search for electronics inventory.
 * Seamlessly resolves store inventory for both Store Owners and Customers.
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

const productController = {
  // GET /api/products
  getAll(req, res) {
    const storeId = resolveStoreId(req);
    const { category, search, stock_status } = req.query;

    let products = db.findAll('products', p => p.merchant_id === storeId);
    if (!products.length) {
      products = db.findAll('products'); // Fallback if multi-tenant default
    }

    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        (Array.isArray(p.specs) && p.specs.some(spec => spec.toLowerCase().includes(s)))
      );
    }

    if (stock_status === 'low') {
      products = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 3);
    } else if (stock_status === 'out') {
      products = products.filter(p => p.stock_quantity <= 0);
    } else if (stock_status === 'in') {
      products = products.filter(p => p.stock_quantity > 0);
    }

    const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 3).length;
    const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length;

    res.json({
      success: true,
      products,
      meta: {
        total: products.length,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount
      }
    });
  },

  // GET /api/products/:id
  getById(req, res) {
    const { id } = req.params;
    const product = db.findOne('products', p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  },

  // POST /api/products (Store Owner Only)
  create(req, res) {
    if (req.merchant?.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Only store managers can add products' });
    }
    const storeId = resolveStoreId(req);
    const { title, category, price, stock_quantity, specs, description, image_url, image_icon, is_featured } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, message: 'Title, category, and price are required' });
    }

    const newProduct = db.insert('products', {
      id: uuidv4(),
      merchant_id: storeId,
      title: title.trim(),
      category: category.trim(),
      price: Number(price),
      stock_quantity: Number(stock_quantity || 0),
      specs: Array.isArray(specs) ? specs : (typeof specs === 'string' ? specs.split(',').map(s => s.trim()) : []),
      description: description || '',
      image_url: image_url || '',
      image_icon: image_icon || '📦',
      inquiry_count: 0,
      is_featured: Boolean(is_featured)
    });

    res.status(201).json({ success: true, product: newProduct, message: 'Product created successfully' });
  },

  // PUT /api/products/:id
  update(req, res) {
    const { id } = req.params;
    const storeId = resolveStoreId(req);

    const existing = db.findOne('products', p => p.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock_quantity !== undefined) updates.stock_quantity = Number(updates.stock_quantity);
    if (updates.specs && typeof updates.specs === 'string') {
      updates.specs = updates.specs.split(',').map(s => s.trim());
    }

    const updated = db.update('products', id, updates);
    res.json({ success: true, product: updated, message: 'Product updated successfully' });
  },

  // DELETE /api/products/:id
  delete(req, res) {
    if (req.merchant?.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Only store managers can delete products' });
    }
    const { id } = req.params;
    const existing = db.findOne('products', p => p.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    db.delete('products', id);
    res.json({ success: true, message: 'Product deleted from catalog' });
  }
};

module.exports = productController;
