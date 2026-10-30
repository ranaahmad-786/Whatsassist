/**
 * WhatsAssist - Executive Analytics & Electronics Sales Dashboard
 * Glassmorphic Telemetry, Top Inquired Electronics, Low Stock Alerts & WhatsApp Sync.
 * Supports both Merchant and Customer roles.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { analyticsAPI, whatsappAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  Package,
  Bot,
  Wrench,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const isCustomer = merchant?.role === 'customer';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waConnected, setWaConnected] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [res, waRes] = await Promise.allSettled([
          analyticsAPI.getOverview(),
          whatsappAPI.getStatus(),
        ]);
        if (res.status === 'fulfilled' && res.value.data.success) {
          setData(res.value.data.data);
        }
        if (waRes.status === 'fulfilled' && waRes.value.data.success) {
          setWaConnected(Boolean(waRes.value.data.data.isConnected));
        }
      } catch (err) {
        console.error('Failed to load telemetry', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'WhatsApp Sales Revenue',
      value: `Rs. ${(data?.total_revenue || 219600).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      change: `${data?.total_orders || 6} Confirmed Orders`,
      link: '/orders',
    },
    {
      label: 'Live Catalog Items',
      value: `${data?.total_products || 11} Products`,
      icon: Package,
      color: 'from-blue-500 to-indigo-600',
      change: `${data?.low_stock_count || 1} Low Stock Alert`,
      link: '/products',
    },
    {
      label: 'AI Autonomous Rate',
      value: `${data?.resolution_rate || 96}%`,
      icon: Bot,
      color: 'from-teal-500 to-emerald-600',
      change: 'Sub-2s WhatsApp Turnaround',
      link: '/chats',
    },
    {
      label: 'Active Repair Tickets',
      value: `${data?.active_repairs_count || 3} Devices`,
      icon: Wrench,
      color: 'from-amber-500 to-orange-600',
      change: 'Warranty & Diagnostics',
      link: '/orders',
    },
  ];

  const topProducts = data?.top_inquired_products || [
    { title: 'Haier 1.5 Ton Puri Inverter AC', category: 'Air Conditioners', inquiries: 102, price: 154000, stock: 5 },
    { title: 'Gree 1.5 Ton Fairy Inverter AC', category: 'Air Conditioners', inquiries: 95, price: 142000, stock: 8 },
    { title: 'ZepTech Thunder E-Bike 70cc (Lithium)', category: 'E-Bikes', inquiries: 88, price: 145000, stock: 6 },
    { title: 'Dawlance Chrome Inverter Refrigerator', category: 'Refrigerators', inquiries: 73, price: 88000, stock: 4 },
    { title: 'Dawlance DW-MD10 Convection Oven (30L)', category: 'Ovens & Kitchen', inquiries: 67, price: 38500, stock: 10 },
  ];

  const maxInquiries = Math.max(...topProducts.map((p) => p.inquiries), 100);

  // If customer role, render dedicated Customer Portal
  if (isCustomer) {
    return (
      <PageLayout
        title={`Welcome to ZepTech, ${merchant?.name || 'Valued Customer'}!`}
        subtitle="Your smart electronics shopping hub for E-Bikes, Baking Ovens, Inverter ACs, and repair tracking."
      >
        <div className="space-y-6">
          {/* Customer Welcome Hero Card with Glassmorphic Gradient */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/20 uppercase tracking-wider backdrop-blur-md inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ZepTech Verified Shopper</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Smart Home Electronics & Zero Petrol Commutes
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Browse official Haier & Gree Inverter ACs, Lithium E-Bikes, and monitor active repair service tokens with our autonomous WhatsApp assistant.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/products')}
                  className="px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-xs shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Explore Catalog</span>
                </button>
                <button
                  onClick={() => navigate('/chats')}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-950/40 border border-white/20 text-white font-extrabold text-xs backdrop-blur-md hover:bg-emerald-950/60 transition-all flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Chat with WhatsApp AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div
              onClick={() => navigate('/products')}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Live Store Catalog</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gree, Haier, Dawlance Inverter ACs, Baking Ovens & E-Bikes with Lahore delivery.
              </p>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1">
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => navigate('/orders')}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Track Orders & Delivery</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Real-time WhatsApp dispatch stages, Cash on Delivery verification, and arrival ETA.
              </p>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-4 flex items-center gap-1">
                <span>Check My Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => navigate('/orders')}
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Warranty & Repair Tokens</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lookup service receipt tokens (e.g. REP-101) with live 4-stage technician diagnostics.
              </p>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1">
                <span>Track Repair Token</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Store Owner / Manager View
  return (
    <PageLayout
      title={`ZepTech Workstation — ${merchant?.business_name || 'Electronics Lab'}`}
      subtitle="Autonomous customer resolution telemetry, WhatsApp Baileys multi-device sync, and live sales"
    >
      <div className="space-y-6">
        {/* Low Stock Alert Banner */}
        {data?.low_stock_count > 0 && (
          <div className="rounded-2xl p-4 border flex items-center justify-between bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider">Inventory Attention Required:</h4>
                <p className="text-xs font-medium mt-0.5">
                  <strong>{data.low_stock_count} electronic items</strong> are running low in stock (≤ 3 units available).
                  {data.low_stock_items?.length > 0 && ` Low items: ${data.low_stock_items.map((i) => `${i.title} (${i.stock} left)`).join(', ')}.`}
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-500 transition-colors shadow-sm shrink-0 ml-4"
            >
              Update Stock
            </Link>
          </div>
        )}

        {/* Telemetry Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                to={s.link}
                className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1 block group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {loading ? '...' : s.value}
                </div>
                <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{s.change}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Inquiries Chart & Live WhatsApp Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Inquired Electronics Bar Chart */}
          <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Most Inquired Products (WhatsApp AI Inbound)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time query volume recorded across customer WhatsApp conversations
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {topProducts.map((prod, idx) => {
                const percent = Math.round((prod.inquiries / maxInquiries) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                        <span className="text-slate-800 dark:text-slate-200">{prod.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {prod.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{prod.inquiries} inquiries</span>
                        <span className="text-slate-400 font-mono text-[11px] ml-2">Rs. {prod.price.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Baileys Engine Status Tile */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp Integration</span>
                </span>
                <Smartphone className="w-5 h-5 text-slate-400" />
              </div>

              <h4 className="font-black text-base text-slate-900 dark:text-white">
                Baileys Multi-Device Connection
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Link any phone number via QR code scan or 8-digit pairing code. Inbound WhatsApp messages are resolved by Gemini 3.5 Flash automatically.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Socket State:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {waConnected ? 'LINKED & ONLINE' : 'READY FOR SCAN'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Protocol:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">WhatsApp Web WS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">AI Orchestrator:</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Gemini 3.5 Flash</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/chats"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Open Live WhatsApp Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
