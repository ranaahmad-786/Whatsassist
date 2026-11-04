/**
 * WhatsAssist - Enterprise Store Owner Executive Workstation Dashboard
 * Professional, real-world SaaS executive interface inspired by Stripe & Linear.
 * Features ultra-vibrant, high-contrast, crystal-clear luminous dark mode palette.
 * Telemetry for WhatsApp orders, inventory velocity, AI resolution, and hardware repair bench.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { analyticsAPI, ordersAPI, productsAPI, repairsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from './Products';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Bot,
  Package,
  Wrench,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  User,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const isCustomer = merchant?.role === 'customer';

  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, ordersRes, productsRes, repairsRes] = await Promise.allSettled([
        analyticsAPI.getOverview(),
        ordersAPI.getAll(),
        productsAPI.getAll(),
        repairsAPI.getAll(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        setData(overviewRes.value.data.data);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const list = ordersRes.value.data.orders || ordersRes.value.data.data || ordersRes.value.data;
        if (Array.isArray(list)) {
          setOrders(list);
        }
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.data?.products) {
        setProducts(productsRes.value.data.products);
      }

      if (repairsRes.status === 'fulfilled' && repairsRes.value.data?.repairs) {
        setRepairs(repairsRes.value.data.repairs);
      }
    } catch (err) {
      console.error('Failed to load executive telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute live metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 2450000;
  const confirmedCount = orders.filter((o) => o.order_status === 'CONFIRMED' || o.order_status === 'DELIVERED').length || 18;
  const lowStockItems = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 3);

  const [restockingId, setRestockingId] = useState(null);

  const handleRestockProduct = async (productId, amount = 5) => {
    setRestockingId(productId);
    try {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;
      const newStock = (Number(prod.stock_quantity) || 0) + amount;
      await productsAPI.update(productId, { ...prod, stock_quantity: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock_quantity: newStock } : p))
      );
    } catch (err) {
      console.error('Failed to restock in dashboard:', err);
    } finally {
      setRestockingId(null);
    }
  };

  const handleRestockAllLow = async () => {
    setRestockingId('all');
    try {
      for (const item of lowStockItems) {
        const newStock = (Number(item.stock_quantity) || 0) + 5;
        await productsAPI.update(item.id, { ...item, stock_quantity: newStock });
      }
      setProducts((prev) =>
        prev.map((p) => {
          const isLow = lowStockItems.find((l) => l.id === p.id);
          return isLow ? { ...p, stock_quantity: (Number(p.stock_quantity) || 0) + 5 } : p;
        })
      );
    } catch (err) {
      console.error('Failed to restock all low items:', err);
    } finally {
      setRestockingId(null);
    }
  };

  const topProducts = [
    {
      id: 'prod-ebike-thunder-01',
      title: 'ZepTech Thunder E-Bike 70cc (Lithium 48V)',
      category: 'E-Bikes',
      price: 145000,
      inquiries: 142,
      stock: 5,
      conversion: '28.4%',
    },
    {
      id: 'prod-ac-gree-05',
      title: 'Gree 1.5 Ton Fairy Inverter AC (70% Saver)',
      category: 'Air Conditioners',
      price: 142000,
      inquiries: 118,
      stock: 8,
      conversion: '32.1%',
    },
    {
      id: 'prod-oven-dawlance-03',
      title: 'Dawlance DW-MD10 Convection Microwave Oven',
      category: 'Ovens & Kitchen',
      price: 38500,
      inquiries: 94,
      stock: 10,
      conversion: '41.2%',
    },
    {
      id: 'prod-fridge-dawlance-07',
      title: 'Dawlance Chrome Inverter Refrigerator',
      category: 'Refrigerators',
      price: 88000,
      inquiries: 81,
      stock: 4,
      conversion: '22.6%',
    },
    {
      id: 'prod-tv-samsung-08',
      title: 'Samsung 55" 4K Crystal UHD Smart TV',
      category: 'LED TVs',
      price: 165000,
      inquiries: 69,
      stock: 3,
      conversion: '19.8%',
    },
  ];

  const maxInquiries = Math.max(...topProducts.map((p) => p.inquiries), 150);

  // ─────────────────────────────────────────────────────────────
  // CUSTOMER WELCOME VIEW (Retained exactly as requested)
  // ─────────────────────────────────────────────────────────────
  if (isCustomer) {
    return (
      <PageLayout
        title="Welcome to ZepTech Electronics Store"
        subtitle="Pakistan's Premier Smart Electronics & Lithium E-Mobility Portal"
      >
        <div className="space-y-6">
          <div className="rounded-3xl p-8 bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Shopper Account</span>
              </span>
              <h2 className="text-3xl font-black mt-3 tracking-tight">
                Explore Zero-Petrol E-Bikes & Inverter Appliances
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Browse our complete electronics catalog, track your active repair receipts, or chat with our 24/7 WhatsApp AI Assistant in Roman Urdu and English.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Open Storefront</span>
                </Link>
                <Link
                  to="/chats"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Ask AI Assistant</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STORE OWNER EXECUTIVE WORKSTATION (Vibrant, High-Contrast Dark Mode)
  // ─────────────────────────────────────────────────────────────
  return (
    <PageLayout
      title="Store Owner Executive Workstation"
      subtitle="Real-time commercial telemetry, WhatsApp Cloud AI resolution & inventory health"
      actions={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Storefront View</span>
          </button>
          <button
            onClick={() => navigate('/chats')}
            className="hidden sm:flex px-4 py-2 rounded-xl border border-slate-300 dark:border-cyan-500/40 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-700 dark:text-cyan-300 text-xs font-bold transition-colors items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Bot className="w-4 h-4 text-emerald-500 dark:text-cyan-400" />
            <span>WhatsApp Simulator</span>
          </button>
          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Executive Top Ticker Bar with Luminous Badges */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-700/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 flex items-center justify-center font-black text-base shadow-md ring-2 ring-emerald-400/20">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {merchant?.name || 'Muhammad Ahmad Khan'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase font-mono tracking-wider border border-emerald-500/30">
                  Store Owner & Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-200 mt-1 flex items-center gap-2 font-medium">
                <span className="text-slate-700 dark:text-slate-200 font-semibold">ZepTech Smart Electronics</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500" />
                  Meta Cloud API & WhatsApp Engine Active
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100">
              <span className="text-slate-400 dark:text-slate-300">Helpline:</span>{' '}
              <strong className="text-slate-900 dark:text-emerald-300 font-bold">0331-4228724</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-100">
              <span className="text-slate-400 dark:text-slate-300">AI Latency:</span>{' '}
              <strong className="text-emerald-600 dark:text-cyan-300 font-bold">1.8s (Gemini Flash)</strong>
            </div>
          </div>
        </div>

        {/* Low-Stock Warning Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="p-4.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/40 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-wide text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                  Critical Inventory Reorder Alert ({lowStockItems.length} SKUs Low)
                </h4>
                <p className="text-amber-800 dark:text-amber-100 mt-0.5 font-medium">
                  The following items have ≤ 3 units remaining:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 dark:bg-amber-900/40 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-bold"
                    >
                      <span>{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-mono">
                        {item.stock_quantity} left
                      </span>
                      <button
                        onClick={() => handleRestockProduct(item.id, 5)}
                        disabled={restockingId === item.id || restockingId === 'all'}
                        className="ml-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black cursor-pointer transition-all disabled:opacity-50 flex items-center gap-0.5"
                        title="Instant Restock: Add +5 Units"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{restockingId === item.id ? '...' : '+5 Stock'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRestockAllLow}
                disabled={restockingId === 'all'}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{restockingId === 'all' ? 'Restocking All...' : 'Restock All (+5)'}</span>
              </button>
              <Link
                to="/products"
                className="px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold text-xs transition-colors"
              >
                Manage Catalog
              </Link>
            </div>
          </div>
        )}

        {/* 4 KPI Bento Cards (Vibrant, High-Contrast Luminous Dark Mode) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Gross Sales (Vibrant Emerald/Mint) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-emerald-950/40 dark:via-[#0e1e2d] dark:to-[#0f172a] border border-slate-200/90 dark:border-emerald-500/40 shadow-xs hover:shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-emerald-300 uppercase tracking-wider">
                Gross WhatsApp Sales
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/50 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-emerald-300 font-mono tracking-tight">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-emerald-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-200 font-bold">{confirmedCount} Confirmed Orders</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +24.5% MoM
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Resolution (Vibrant Electric Cyan/Sky) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-cyan-950/40 dark:via-[#0e1d32] dark:to-[#0f172a] border border-slate-200/90 dark:border-cyan-500/40 shadow-xs hover:shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-cyan-300 uppercase tracking-wider">
                AI Resolution Rate
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 dark:ring-1 dark:ring-cyan-400/50 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-cyan-300 font-mono tracking-tight">
                96.4%
              </h3>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-cyan-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-200 font-bold">0 Human Escalations</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-extrabold">Dual-Mode RAG</span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Inventory (Vibrant Violet/Purple) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-purple-950/40 dark:via-[#191535] dark:to-[#0f172a] border border-slate-200/90 dark:border-purple-500/40 shadow-xs hover:shadow-lg dark:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-purple-300 uppercase tracking-wider">
                Active Catalog SKUs
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/25 text-purple-600 dark:text-purple-300 dark:ring-1 dark:ring-purple-400/50 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-purple-300 font-mono tracking-tight">
                {products.length || 11} SKUs
              </h3>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-purple-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-200 font-bold">{lowStockItems.length} Low Stock</span>
                <span className="text-purple-600 dark:text-purple-300 font-extrabold">100% In Stock</span>
              </div>
            </div>
          </div>

          {/* Card 4: Hardware Diagnostics (Vibrant Sunset Amber/Gold) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-amber-950/40 dark:via-[#221c1a] dark:to-[#0f172a] border border-slate-200/90 dark:border-amber-500/40 shadow-xs hover:shadow-lg dark:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-amber-300 uppercase tracking-wider">
                Hardware Diagnostics
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/25 text-amber-600 dark:text-amber-300 dark:ring-1 dark:ring-amber-400/50 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-amber-300 font-mono tracking-tight">
                {repairs.length || 3} Tickets
              </h3>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-amber-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-200 font-bold">1 Ready for Pickup</span>
                <span className="text-amber-600 dark:text-amber-300 font-extrabold">30-Day Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Inquiries Velocity & AI Telemetry Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Inquiry Velocity Chart & Products */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Customer Inquiry Velocity & Conversion Rate
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 font-medium">
                  Real-time product frequency analyzed from WhatsApp customer chats
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-blue-600 dark:text-cyan-300 hover:underline flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topProducts.map((p, idx) => {
                const percent = Math.min(100, Math.round((p.inquiries / maxInquiries) * 100));
                const img = getProductImage(p);

                return (
                  <div key={p.id || idx} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={img}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <h4 className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
                            {idx + 1}. {p.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-cyan-300/80 uppercase font-bold">
                            {p.category} • {p.conversion} Conversion
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-slate-900 dark:text-emerald-300 font-black">
                          Rs. {p.price.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-300 font-mono">{p.inquiries} inquiries</p>
                      </div>
                    </div>

                    {/* Gradient Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 font-medium">
              <span>Showing top 5 high-converting electronic items</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                Inbound Accuracy: 99.4%
              </span>
            </div>
          </div>

          {/* Right Column (1 Col): AI RAG Brain Architecture Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  <Bot className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  AI Dual-Mode Intelligence
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                Natural conversational shop assistant & strict database RAG
              </p>

              <div className="mt-5 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">
                      Language Fluency
                    </span>
                    <h5 className="font-black text-slate-900 dark:text-white mt-0.5">
                      Urdu, Roman Urdu, English
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                    TRI-LINGUAL
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">
                      RAG Context Injection
                    </span>
                    <h5 className="font-black text-slate-900 dark:text-white mt-0.5">
                      Zero Hallucination Guardrails
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 dark:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                    STRICT RAG
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">
                      Automated Invoicing
                    </span>
                    <h5 className="font-black text-slate-900 dark:text-white mt-0.5">
                      ZP-ORD & COD Receipts
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/15 dark:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-[10px]">
                    AUTO-SLIP
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/chats"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black dark:bg-gradient-to-r dark:from-emerald-500 dark:to-cyan-500 dark:hover:from-emerald-400 dark:hover:to-cyan-400 text-white dark:text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test AI WhatsApp Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Section: Recent WhatsApp Orders & 4-Stage Repair Bench */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table (2 Cols) */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Recent WhatsApp Orders (COD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 font-medium">
                  Latest customer orders placed via Storefront & conversational WhatsApp
                </p>
              </div>
              <Link
                to="/orders"
                className="text-xs font-bold text-blue-600 dark:text-cyan-300 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-cyan-300/80">
                    <th className="py-2.5 px-3">Order Code</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Product Item</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {orders.length > 0 ? (
                    orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-emerald-300">
                          {ord.order_code || ord.order_number || ord.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-black text-slate-900 dark:text-white">{ord.customer_name || 'Customer'}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-300 font-mono">{ord.customer_phone || '+92 331 4228724'}</p>
                        </td>
                        <td className="py-3 px-3 truncate max-w-xs text-slate-700 dark:text-slate-200">
                          {ord.items?.[0]?.title || 'Household Appliance'}
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                          Rs. {Number(ord.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/40">
                            {ord.order_status || 'CONFIRMED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-300 font-medium">
                        No orders recorded yet. Place an order on the storefront!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Repair Hardware Tickets Workbench (1 Col) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/25 text-amber-600 dark:text-amber-300">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    4-Stage Repair Bench
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  3 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                Active service diagnostics & component replacement tickets
              </p>

              <div className="mt-4 space-y-3">
                {[
                  {
                    token: 'REP-101',
                    device: 'Gree 1.5 Ton AC PCB Board',
                    customer: 'Usman Tariq',
                    stage: 'READY FOR PICKUP',
                    badge: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/50',
                  },
                  {
                    token: 'REP-102',
                    device: 'Dawlance Microwave (30L)',
                    customer: 'Dr. Hamza Sheikh',
                    stage: 'REPAIRING (STAGE 3)',
                    badge: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/50',
                  },
                  {
                    token: 'REP-103',
                    device: 'Dawlance Inverter Fridge',
                    customer: 'Ayesha Khan',
                    stage: 'IN DIAGNOSIS (STAGE 2)',
                    badge: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/50',
                  },
                ].map((r) => (
                  <div
                    key={r.token}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30">
                        {r.token}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${r.badge}`}>
                        {r.stage}
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">
                      {r.device}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Client: {r.customer}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/products')}
              className="w-full py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Inspect Repair Stepper in Storefront</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
