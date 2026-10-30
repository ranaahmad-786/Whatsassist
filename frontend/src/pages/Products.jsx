/**
 * WhatsAssist - Electronics Product Catalog & Storefront
 * Glassmorphic UI with Category Chips, Stock Status Meters, WhatsApp 1-Click Order,
 * and Lucide Icons.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ShoppingBag,
  MessageSquare,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function Products() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const isCustomer = merchant?.role === 'customer';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
  const [meta, setMeta] = useState({ total: 0, low_stock_count: 0, out_of_stock_count: 0 });

  // Store Owner Add/Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'E-Bikes',
    price: '',
    stock_quantity: 5,
    specs: '',
    description: '',
    image_icon: '',
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);

  // Customer 1-Click Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customer_name: merchant?.name || '',
    customer_phone: merchant?.phone || '',
    delivery_address: 'House 42, Gulberg III, Lahore',
  });
  const [ordering, setOrdering] = useState(false);

  const categories = [
    'All',
    'E-Bikes',
    'Ovens & Kitchen',
    'Air Conditioners',
    'Refrigerators',
    'LED TVs',
    'Household Electronics',
    'Accessories',
  ];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      if (stockFilter !== 'all') params.stock_status = stockFilter;

      const res = await productsAPI.getAll(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, stockFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'E-Bikes',
      price: '',
      stock_quantity: 5,
      specs: '',
      description: '',
      image_icon: '',
      is_featured: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingId(p.id);
    setFormData({
      title: p.title,
      category: p.category,
      price: p.price,
      stock_quantity: p.stock_quantity,
      specs: p.specs || '',
      description: p.description || '',
      image_icon: p.image_icon || '',
      is_featured: Boolean(p.is_featured),
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
      };

      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }
      setShowModal(false);
      await loadProducts();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Delete product "${title}" from catalog?`)) return;
    try {
      await productsAPI.delete(id);
      await loadProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleOpenOrderModal = (p) => {
    setSelectedProduct(p);
    setShowOrderModal(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setOrdering(true);
    try {
      const orderCode = `ZP-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      await ordersAPI.create({
        order_code: orderCode,
        customer_name: orderForm.customer_name || 'Valued Shopper',
        customer_phone: orderForm.customer_phone || '+923001234567',
        delivery_address: orderForm.delivery_address,
        items: [
          {
            title: selectedProduct.title,
            price: selectedProduct.price,
            quantity: 1,
          },
        ],
        total_amount: selectedProduct.price,
        payment_method: 'Cash on Delivery (COD)',
      });

      setShowOrderModal(false);
      navigate('/orders');
    } catch (err) {
      console.error('Order placement failed:', err);
    } finally {
      setOrdering(false);
    }
  };

  const handleAskAIAboutProduct = (p) => {
    navigate('/chats', {
      state: {
        prefillQuery: `What are the warranty, specs, and delivery schedule for "${p.title}"?`,
      },
    });
  };

  return (
    <PageLayout
      title={isCustomer ? 'ZepTech Smart Electronics Storefront' : 'Products & Inventory Catalog'}
      subtitle={
        isCustomer
          ? 'Browse genuine Haier, Gree & Dawlance electronics, E-Bikes, and place 1-click orders'
          : 'Multi-category hardware inventory with low stock telemetry and WhatsApp AI mapping'
      }
      actions={
        !isCustomer && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 text-white font-black text-xs shadow-md shadow-neutral-800/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Electronic Item</span>
          </button>
        )
      }
    >
      <div className="space-y-6">
        {/* Category Pills & Filters */}
        <div className="glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, brand, or specs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all"
              />
            </form>

            {/* Stock Filters for Merchant */}
            {!isCustomer && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    stockFilter === 'all'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({meta.total})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    stockFilter === 'low'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low ({meta.low_stock_count})</span>
                </button>
              </div>
            )}
          </div>

          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                    : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading catalog items...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No electronics found</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => {
              const isLow = p.stock_quantity > 0 && p.stock_quantity <= 3;
              const isOut = p.stock_quantity === 0;

              return (
                <div
                  key={p.id}
                  className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  {/* Card Header & Badge */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-2xl p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 group-hover:scale-105 transition-transform inline-block flex items-center justify-center w-12 h-12">
                        {p.image_icon || <Package className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />}
                      </span>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                            isOut
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              : isLow
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-neutral-700 border border-emerald-500/20'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? `Low Stock (${p.stock_quantity})` : `${p.stock_quantity} in stock`}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.category}</div>
                      </div>
                    </div>

                    <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {p.title}
                    </h4>

                    {p.specs && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 font-medium">
                        {p.specs}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Price</span>
                        <span className="text-base font-black text-neutral-700 dark:text-neutral-400 font-mono">
                          Rs. {Number(p.price).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">COD Available</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {isCustomer ? (
                      <>
                        <button
                          onClick={() => handleOpenOrderModal(p)}
                          className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs shadow-md shadow-neutral-800/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Order Now</span>
                        </button>
                        <button
                          onClick={() => handleAskAIAboutProduct(p)}
                          title="Ask AI WhatsApp Assistant"
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-neutral-700 dark:text-neutral-400 hover:bg-slate-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          title="Delete Product"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {editingId ? 'Edit Electronic Product' : 'Add New Electronic Item'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gree 1.5 Ton Fairy Inverter AC"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icon</label>
                  <input
                    type="text"
                    placeholder="e.g. 📦 or leave empty"
                    value={formData.image_icon}
                    onChange={(e) => setFormData({ ...formData, image_icon: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    placeholder="145000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Key Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. T3 Tropical Compressor, 60% Energy Saving, WiFi Smart Control"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 1-Click Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Confirm WhatsApp Order</h3>
                  <p className="text-[11px] text-slate-500">Cash on Delivery · Lahore Dispatch</p>
                </div>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-black text-slate-900 dark:text-white">{selectedProduct.title}</div>
                <div className="font-black text-neutral-700 dark:text-neutral-400 font-mono text-sm">
                  Rs. {Number(selectedProduct.price).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  required
                  value={orderForm.customer_phone}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Address (Lahore)</label>
                <textarea
                  rows={2}
                  required
                  value={orderForm.delivery_address}
                  onChange={(e) => setOrderForm({ ...orderForm, delivery_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ordering}
                  className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs shadow-md"
                >
                  {ordering ? 'Confirming...' : 'Place COD Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
