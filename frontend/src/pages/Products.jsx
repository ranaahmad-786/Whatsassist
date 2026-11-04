/**
 * WhatsAssist - ZepTech Smart Electronics & E-Mobility Storefront & Inventory Workstation
 * Completely aligned with PTUT Final Year Project Wireframe & Specifications.
 *
 * Modules:
 * 1. Customer Storefront & Catalog Module (Hero Carousel, Featured Categories, Trending Products Grid)
 * 2. Instant 1-Click Checkout Module (Sleek modal, ZP-ORD-xxxx generator, stock decrement, printable slip)
 * 3. WhatsApp AI RAG Chatbot Module (Floating Action Button + Gemini Flash RAG chat)
 * 4. 4-Stage Repair Tracking Module (Interactive visual stepper for REP-101 tokens)
 * 5. Inventory CRUD Manager (Owner mode with stock alerts & modal controls)
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import StorefrontNavbar from '../components/StorefrontNavbar';
import StorefrontHero from '../components/StorefrontHero';
import RepairTracker from '../components/RepairTracker';
import CheckoutModal from '../components/CheckoutModal';
import FloatingWhatsAppChat from '../components/FloatingWhatsAppChat';
import CartDrawer from '../components/CartDrawer';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import acGreeImg from '../assets/products/ac-gree.jpg';
import acHaierImg from '../assets/products/ac-haier.jpg';
import surgeImg from '../assets/products/surge-protector.jpg';
import haierMicroImg from '../assets/products/haier-microwave.jpg';
import dawlanceMicroImg from '../assets/products/dawlance-microwave.jpg';
import dawlanceFridgeImg from '../assets/products/dawlance-fridge.jpg';
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
  Star,
  Eye,
  Sliders,
  ShieldCheck,
  ChevronRight,
  X,
  Truck,
  RotateCcw,
} from 'lucide-react';

// High-definition verified product assets for Pakistani electronics catalog
export const DEFAULT_PRODUCT_IMAGES = {
  'prod-ebike-thunder-01': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  'prod-ebike-eco-02': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  'prod-oven-dawlance-03': dawlanceMicroImg,
  'prod-oven-haier-04': haierMicroImg,
  'prod-ac-gree-05': acGreeImg,
  'prod-ac-haier-06': acHaierImg,
  'prod-fridge-dawlance-07': dawlanceFridgeImg,
  'prod-tv-samsung-08': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
  'prod-tv-tcl-09': 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80',
  'prod-wm-haier-10': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
  'prod-acc-surge-11': surgeImg,
};

export const getProductImage = (product) => {
  if (product?.id && DEFAULT_PRODUCT_IMAGES[product.id]) {
    return DEFAULT_PRODUCT_IMAGES[product.id];
  }
  const cat = product?.category;
  if (cat === 'E-Bikes') return DEFAULT_PRODUCT_IMAGES['prod-ebike-thunder-01'];
  if (cat === 'Refrigerators') return dawlanceFridgeImg;
  if (cat === 'Air Conditioners') return acGreeImg;
  if (cat === 'Ovens & Kitchen' || cat === 'Kitchen Appliances') return haierMicroImg;
  if (cat === 'LED TVs') return DEFAULT_PRODUCT_IMAGES['prod-tv-samsung-08'];
  if (cat === 'Household Electronics') return DEFAULT_PRODUCT_IMAGES['prod-wm-haier-10'];
  if (cat === 'Accessories') return surgeImg;
  if (product?.image_url && typeof product.image_url === 'string' && product.image_url.startsWith('http')) {
    return product.image_url;
  }
  return surgeImg;
};

// 4 Featured Categories matching the wireframe row
const FEATURED_CATEGORIES = [
  {
    key: 'E-Bikes',
    title: 'E-Bikes & Scooters',
    subtitle: 'Zero Petrol E-Mobility',
    icon: '🛵',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    count: '2 Models',
    accent: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    key: 'Air Conditioners',
    title: 'Inverter ACs',
    subtitle: '70% Energy Saver T3',
    icon: '❄️',
    image: acGreeImg,
    count: '2 Models',
    accent: 'border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20',
  },
  {
    key: 'Ovens & Kitchen',
    title: 'Kitchen Appliances',
    subtitle: 'Microwave & Convection',
    icon: '🍳',
    image: haierMicroImg,
    count: '2 Models',
    accent: 'border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    key: 'Refrigerators',
    title: 'Refrigerators',
    subtitle: 'Low-Voltage Inverter',
    icon: '🧊',
    image: dawlanceFridgeImg,
    count: '1 Model',
    accent: 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
];

export default function Products() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const isOwner = merchant?.role === 'owner' || merchant?.role === 'admin';

  // Toggle between Wireframe Storefront view and Owner Inventory CRUD Workstation
  const [viewMode, setViewMode] = useState('storefront'); // 'storefront' or 'workstation'

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const [meta, setMeta] = useState({ total: 11, low_stock_count: 2, out_of_stock_count: 0 });

  // 1-Click Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  // Product Details Specs Modal
  const [detailProduct, setDetailProduct] = useState(null);

  // Cart Drawer
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Store Owner CRUD Modal State
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [crudFormData, setCrudFormData] = useState({
    title: '',
    category: 'E-Bikes',
    price: '',
    stock_quantity: 5,
    specs: '',
    description: '',
    image_url: '',
    is_featured: false,
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    'All',
    'E-Bikes',
    'Ovens & Kitchen',
    'Air Conditioners',
    'Refrigerators',
    'LED TVs',
    'Household Electronics',
  ];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All' && selectedCategory !== 'Appliances') {
        params.category = selectedCategory;
      }
      if (search) params.search = search;
      if (stockFilter !== 'all') params.stock_status = stockFilter;

      const res = await productsAPI.getAll(params);
      if (res.data?.success) {
        setProducts(res.data.products);
        if (res.data.meta) setMeta(res.data.meta);

        // Pre-fill default cart item for instant demo
        if (cartItems.length === 0 && res.data.products?.length > 0) {
          setCartItems([res.data.products[0]]);
        }
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

  const handleOpenOrder = (p) => {
    setCheckoutProduct(p);
    setShowCheckoutModal(true);
  };

  const handleAddToCart = (p) => {
    setCartItems((prev) => {
      const exists = prev.find((it) => it.id === p.id);
      if (exists) return prev;
      return [...prev, p];
    });
    setCartOpen(true);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Owner CRUD helpers
  const handleOpenAdd = () => {
    setEditingId(null);
    setCrudFormData({
      title: '',
      category: 'E-Bikes',
      price: '',
      stock_quantity: 5,
      specs: '',
      description: '',
      image_url: '',
      is_featured: false,
    });
    setShowCrudModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setCrudFormData({
      title: p.title,
      category: p.category,
      price: p.price,
      stock_quantity: p.stock_quantity,
      specs: p.specs || '',
      description: p.description || '',
      image_url: p.image_url || '',
      is_featured: Boolean(p.is_featured),
    });
    setShowCrudModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...crudFormData,
        price: Number(crudFormData.price),
        stock_quantity: Number(crudFormData.stock_quantity),
      };
      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }
      setShowCrudModal(false);
      await loadProducts();
    } catch (err) {
      console.error('Product save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Delete product "${title}" from inventory?`)) return;
    try {
      await productsAPI.delete(id);
      await loadProducts();
    } catch (err) {
      console.error('Product delete error:', err);
    }
  };

  const [restockingId, setRestockingId] = useState(null);

  const handleQuickRestock = async (product, amount = 5) => {
    setRestockingId(product.id);
    try {
      const currentStock = Number(product.stock_quantity) || 0;
      const newStock = currentStock + amount;
      await productsAPI.update(product.id, {
        ...product,
        stock_quantity: newStock,
      });
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, stock_quantity: newStock } : item))
      );
      setMeta((prev) => {
        const updatedProds = products.map((item) =>
          item.id === product.id ? { ...item, stock_quantity: newStock } : item
        );
        const lowCount = updatedProds.filter((p) => (p.stock_quantity || 0) <= 3).length;
        return { ...prev, low_stock_count: lowCount };
      });
    } catch (err) {
      console.error('Quick restock failed:', err);
    } finally {
      setRestockingId(null);
    }
  };

  // Filter products for category shortcuts
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Appliances') {
      return (
        p.category === 'Air Conditioners' ||
        p.category === 'Refrigerators' ||
        p.category === 'Ovens & Kitchen' ||
        p.category === 'Household Electronics'
      );
    }
    return p.category === selectedCategory;
  });

  // ─────────────────────────────────────────────────────────────
  // RENDER: OWNER WORKSTATION VIEW (if active)
  // ─────────────────────────────────────────────────────────────
  if (isOwner && viewMode === 'workstation') {
    return (
      <PageLayout
        title="Inventory CRUD & Telemetry Manager"
        subtitle="Manage product listings, update stock levels, and monitor low inventory warnings"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('storefront')}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Preview Customer Storefront</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Electronic Item</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Stock Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setStockFilter('all')}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                stockFilter === 'all'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalog Items</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{products.length} Products</h3>
                  <span className="text-[11px] text-blue-500 font-bold mt-1 inline-block">Filter: View All</span>
                </div>
                <span className="p-3 rounded-xl bg-blue-500/10 text-blue-500 text-xl">📦</span>
              </div>
            </div>
            <div
              onClick={() => setStockFilter('low')}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                stockFilter === 'low'
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
                  <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{meta.low_stock_count} Items</h3>
                  <span className="text-[11px] text-amber-500 font-bold mt-1 inline-block">Filter: Low Stock Only</span>
                </div>
                <span className="p-3 rounded-xl bg-amber-500/10 text-amber-500 text-xl">⚠️</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI RAG Sync Status</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">100% Synced</h3>
                <span className="text-[11px] text-emerald-500 font-bold mt-1 inline-block">Gemini Flash Ready</span>
              </div>
              <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xl">🤖</span>
            </div>
          </div>

          {/* Workstation Filters */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    stockFilter === f
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f === 'all' ? `All (${products.length})` : `Low Stock (${meta.low_stock_count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table / Grid for Workstation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const isLow = p.stock_quantity > 0 && p.stock_quantity <= 3;
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={getProductImage(p)}
                      alt={p.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {p.title}
                      </h4>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                        Rs. {Number(p.price).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                          isLow
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {p.stock_quantity} in stock
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleQuickRestock(p, 5)}
                      disabled={restockingId === p.id}
                      className="py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Quick Restock +5 Units"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{restockingId === p.id ? '...' : '+5 Stock'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {showCrudModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Product Item' : 'Add New Electronic Item'}
                </h3>
                <button onClick={() => setShowCrudModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={crudFormData.title}
                    onChange={(e) => setCrudFormData({ ...crudFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      value={crudFormData.category}
                      onChange={(e) => setCrudFormData({ ...crudFormData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={crudFormData.price}
                      onChange={(e) => setCrudFormData({ ...crudFormData, price: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={crudFormData.stock_quantity}
                    onChange={(e) => setCrudFormData({ ...crudFormData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specifications (Specs)</label>
                  <input
                    type="text"
                    value={crudFormData.specs}
                    onChange={(e) => setCrudFormData({ ...crudFormData, specs: e.target.value })}
                    placeholder="e.g. 70km Range, 48V Battery, Inverter Motor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCrudModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 text-white text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: WIREFRAME-ALIGNED CUSTOMER STOREFRONT
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#0b141a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. Wireframe Header & Top Navigation */}
      <StorefrontNavbar
        cartCount={cartItems.length}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={search}
        onSearchChange={setSearch}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenOwnerView={isOwner ? () => setViewMode('workstation') : null}
      />

      {/* Main Storefront Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* 2. Hero Carousel (ZepTech E-Bikes Flagship Banner) */}
        <StorefrontHero
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onShopNow={() => {
            const el = document.getElementById('trending-products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Featured Categories Row matching Wireframe (4 Sleek Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Categories
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Verified PTUT Electronics Inventory
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <div
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between min-h-[140px] bg-white dark:bg-slate-900 ${
                    isSelected
                      ? 'border-slate-900 dark:border-emerald-500 ring-2 ring-slate-900/10 dark:ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl filter drop-shadow-sm">{cat.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {cat.count}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Trending Products Section matching Wireframe (4-Column Grid) */}
        <section id="trending-products-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Trending Products
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top rated appliances with instant 1-click Cash on Delivery checkout
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid matching Wireframe */}
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading live catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found in this category.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const img = getProductImage(p);
                const isLow = p.stock_quantity > 0 && p.stock_quantity <= 3;
                const isOut = p.stock_quantity === 0;

                return (
                  <div
                    key={p.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Product Image Container matching Wireframe wire-box style */}
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4">
                        <img
                          src={img}
                          alt={p.title}
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80';
                          }}
                        />

                        {/* Top Category Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-xs border border-slate-200/50 dark:border-slate-700/50">
                          {p.category}
                        </span>

                        {/* Stock Status Badge */}
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                            isOut
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? `Low Stock (${p.stock_quantity})` : 'In Stock'}
                        </span>
                      </div>

                      {/* Card Information Body */}
                      <div className="p-4 sm:p-5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-emerald-400 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Model: {p.id ? p.id.substring(0, 12).toUpperCase() : 'ZP-MOD-2026'}
                        </p>

                        {/* Rating Stars matching Wireframe (★★★★) */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            4.8 (Verified)
                          </span>
                        </div>

                        {/* Price Row matching Wireframe (PKR 125,000 - 450,000) */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Price
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
                              PKR {Number(p.price).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Free Express COD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons matching Wireframe: [View Details] [Order Now] */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDetailProduct(p)}
                        className="py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleOpenOrder(p)}
                        className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>

                    {/* Store Owner Quick Restock Controls (Visible ONLY when logged in as Owner) */}
                    {isOwner && (
                      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 border-t border-amber-200 dark:border-amber-700/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400 shrink-0" />
                          <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 truncate">
                            {p.stock_quantity <= 3 ? `⚠️ Low (${p.stock_quantity} left)` : `Stock: ${p.stock_quantity}`}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickRestock(p, 5);
                          }}
                          disabled={restockingId === p.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                          title="Instant Owner Restock: Add +5 units"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{restockingId === p.id ? 'Restocking...' : '+5 Restock'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. 4-Stage Repair Tracking Module matching Wireframe */}
        <section id="repair-tracker-section">
          <RepairTracker />
        </section>

        {/* 6. Wireframe Footer */}
        <footer className="pt-10 pb-12 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <a href="#trending-products-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            <a href="#repair-tracker-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
            <a href="#repair-tracker-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">Warranty Policy</a>
            <a href="#repair-tracker-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQs</a>
            <a href="#trending-products-section" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
          </div>

          <div className="flex items-center gap-2 text-center sm:text-right">
            <div className="w-5 h-5 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px]">
              Z
            </div>
            <span>© 2024 ZepTech Smart Electronics • PTUT Final Year Project (24-ST-027)</span>
          </div>
        </footer>
      </main>

      {/* 7. Floating WhatsApp AI Assistant Widget (FAB at bottom right) */}
      <FloatingWhatsAppChat
        onOpenOrder={(item) => handleOpenOrder(item)}
      />

      {/* 8. 1-Click Instant Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        product={checkoutProduct}
        onClose={() => {
          setShowCheckoutModal(false);
          setCheckoutProduct(null);
        }}
        customerUser={merchant}
        getProductImage={getProductImage}
        onOrderSuccess={(order) => {
          loadProducts(); // Sync stock decrements
        }}
      />

      {/* 9. Product Details Specs Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 p-2 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                <img
                  src={getProductImage(detailProduct)}
                  alt={detailProduct.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {detailProduct.category}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  {detailProduct.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-slate-500 font-semibold">(4.8 rating • 42 reviews)</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {detailProduct.description || 'Genuine Pakistani warranty backed appliance engineered for high durability, extreme heat resilience, and energy conservation.'}
                </p>

                {detailProduct.specs && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    <strong>Specifications:</strong> {detailProduct.specs}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    PKR {Number(detailProduct.price).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleAddToCart(detailProduct);
                        setDetailProduct(null);
                      }}
                      className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => {
                        const p = detailProduct;
                        setDetailProduct(null);
                        handleOpenOrder(p);
                      }}
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 text-white text-xs font-bold shadow-md"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Shopping Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={(item) => handleOpenOrder(item)}
        getProductImage={getProductImage}
      />
    </div>
  );
}
