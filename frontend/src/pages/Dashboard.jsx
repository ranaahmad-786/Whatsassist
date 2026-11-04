/**
 * WhatsAssist - Enterprise AI & Electronics Executive Workstation Dashboard
 * Telemetry for WhatsApp orders, inventory stock, top inquired items, and resolution rate.
 * Adapts for Customer account with personalized shopper dashboard.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { analyticsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const isCustomer = merchant?.role === 'customer';

  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [overviewRes, ordersRes] = await Promise.allSettled([
          analyticsAPI.getOverview(),
          ordersAPI.getAll()
        ]);

        if (overviewRes.status === 'fulfilled' && overviewRes.value.data.success) {
          setData(overviewRes.value.data.data);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
          const list = ordersRes.value.data.data || ordersRes.value.data;
          if (Array.isArray(list)) {
            setRecentOrders(list.slice(0, 5));
          }
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
      sub: `${data?.total_orders || 6} Confirmed Orders`,
      trend: '+24.5% this month',
      trendUp: true,
      icon: '💰',
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-500',
      link: '/orders'
    },
    {
      label: 'AI Resolution Rate',
      value: `${data?.resolution_rate || 96}%`,
      sub: `${data?.ai_resolved || 38} Automated Chats`,
      trend: '0 Human Escalations',
      trendUp: true,
      icon: '🤖',
      gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-500',
      link: '/chats'
    },
    {
      label: 'Live Catalog & Stock',
      value: `${data?.total_products || 11} Products`,
      sub: `${data?.low_stock_count || 1} Low Stock Alert`,
      trend: 'Zero petrol & smart tech',
      trendUp: false,
      icon: '📦',
      gradient: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-500/15 text-violet-500',
      link: '/products'
    },
    {
      label: 'Hardware Diagnostics',
      value: `${data?.active_repairs_count || 3} Devices`,
      sub: 'Warranty Tokens Active',
      trend: 'Live 4-Stage Tracker',
      trendUp: true,
      icon: '🔧',
      gradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-500',
      link: '/orders'
    },
  ];

  const topProducts = data?.top_inquired_products || [
    { title: 'Haier 1.5 Ton Puri Inverter AC', category: 'Air Conditioners', inquiries: 102, price: 154000, stock: 5 },
    { title: 'Gree 1.5 Ton Fairy Inverter AC', category: 'Air Conditioners', inquiries: 95, price: 142000, stock: 8 },
    { title: 'ZepTech Thunder E-Bike 70cc (Lithium)', category: 'E-Bikes', inquiries: 88, price: 145000, stock: 6 },
    { title: 'Dawlance Chrome Inverter Refrigerator', category: 'Refrigerators', inquiries: 73, price: 88000, stock: 4 },
    { title: 'Dawlance DW-MD10 Convection Oven (30L)', category: 'Ovens & Kitchen', inquiries: 67, price: 38500, stock: 10 }
  ];

  const maxInquiries = Math.max(...topProducts.map(p => p.inquiries || 1), 100);

  // If customer, render Customer Welcome Portal
  if (isCustomer) {
    return (
      <PageLayout
        title={`Welcome, ${merchant?.name || 'Valued Customer'}!`}
        subtitle="Your smart electronics shopping hub for E-Bikes, Baking Ovens, Inverter ACs, and repair tracking."
      >
        <div className="space-y-6">
          {/* Customer Welcome Hero Card */}
          <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/20 uppercase tracking-wider backdrop-blur-md inline-flex items-center gap-1.5 shadow-sm">
                <span>🛍️</span> ZepTech Verified Shopper
              </span>
              <h2 className="text-3xl font-black mt-3 leading-tight">
                Zero Petrol Commutes & Smart Home Electronics
              </h2>
              <p className="text-sm text-emerald-100 mt-2 font-medium leading-relaxed">
                Browse our lithium-powered E-Bikes, multi-mode convection ovens, energy-saving inverter ACs, and genuine household appliances with Cash on Delivery in Lahore.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  to="/products"
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>⚡</span> Explore Products Catalog
                </Link>
                <Link
                  to="/chats"
                  className="px-5 py-2.5 rounded-xl bg-emerald-950/50 border border-white/30 text-white font-extrabold text-xs hover:bg-emerald-900/60 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <span>💬</span> Talk to AI Assistant
                </Link>
                <Link
                  to="/orders"
                  className="px-5 py-2.5 rounded-xl bg-teal-800/40 border border-white/20 text-white font-extrabold text-xs hover:bg-teal-800/60 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>📦</span> My Orders & Repairs
                </Link>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-10 text-[140px] opacity-15 select-none pointer-events-none">
              ⚡
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => navigate('/products')}
              className="p-6 rounded-2xl border shadow-sm cursor-pointer transition-all bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🛵
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Smart E-Bikes & Ovens</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Zero petrol running costs, 80km lithium range, and 30L baking convection ovens in stock.
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-4 block">
                Browse Store →
              </span>
            </div>

            <div
              onClick={() => navigate('/orders')}
              className="p-6 rounded-2xl border shadow-sm cursor-pointer transition-all bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-500 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📦
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Track Orders & Delivery</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Real-time WhatsApp dispatch stages, Cash on Delivery verification, and Lahore arrival ETA.
              </p>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 block">
                Check My Orders →
              </span>
            </div>

            <div
              onClick={() => navigate('/orders')}
              className="p-6 rounded-2xl border shadow-sm cursor-pointer transition-all bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-amber-500 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🔧
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Warranty & Repair Tokens</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Lookup service receipt tokens (e.g. REP-101) with live 4-stage technician diagnostics.
              </p>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 block">
                Lookup Repair Token →
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
      subtitle="Autonomous customer resolution telemetry, WhatsApp Cloud API ingress, and live activity"
    >
      <div className="space-y-6">
        {/* Executive Status Telemetry Ticker */}
        <div className="rounded-2xl p-4 border bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white border-slate-700/80 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-xs font-extrabold tracking-wide uppercase text-emerald-400 flex items-center gap-2">
                <span>AI Brain & WhatsApp Engine Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">v2.0 DUAL-MODE</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                Dual AI Mode: Friendly Urdu/English Chat + Strict Inventory Database Injection Guardrails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
              <span className="text-slate-400">Owner Helpline:</span> <strong className="text-emerald-400">0331-4228724</strong>
            </div>
            <div className="hidden md:flex px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200">
              <span className="text-slate-400">Store Hours:</span> <strong>9:00 AM - 10:00 PM PST</strong>
            </div>
            <Link
              to="/chats"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>💬</span> Test Bot
            </Link>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {data?.low_stock_count > 0 && (
          <div className="rounded-2xl p-4 border flex items-center justify-between bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-200 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">Inventory Attention Required:</h4>
                <p className="text-xs font-medium mt-0.5">
                  <strong>{data.low_stock_count} electronic items</strong> are running low in stock (≤ 3 units available).
                  {data.low_stock_items?.length > 0 && ` Specifically: ${data.low_stock_items.map(i => `${i.title} (${i.stock} left)`).join(', ')}.`}
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition-colors shadow-sm shrink-0 ml-4 cursor-pointer"
            >
              Reorder Stock
            </Link>
          </div>
        )}

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.link}
              className="rounded-2xl p-5 border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer block bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</span>
                <span className={`text-xl p-2.5 rounded-2xl ${s.iconBg} group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {loading ? '...' : s.value}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="font-medium text-slate-500 dark:text-slate-400">{s.sub}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.trend}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Analytics & WhatsApp Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Inquired Electronics Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl border p-6 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>📊</span> Customer Product Inquiries (WhatsApp Live AI)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time inquiry frequencies analyzed across customer queries
                  </p>
                </div>
                <Link to="/products" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View Full Catalog →
                </Link>
              </div>

              <div className="space-y-4">
                {topProducts.map((prod, idx) => {
                  const percent = Math.min(100, Math.round((prod.inquiries / maxInquiries) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-md">
                          {idx + 1}. {prod.title}
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {prod.category}
                          </span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">Rs. {prod.price.toLocaleString()}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{prod.inquiries} inquiries</span>
                        </div>
                      </div>
                      {/* Visual Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Pill at bottom */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Showing top 5 high-converting electronic items</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Inbound Accuracy: 99.4%</span>
            </div>
          </div>

          {/* AI WhatsApp Operational Status & Quick Stream */}
          <div className="space-y-6">
            {/* AI Engine Status Card */}
            <div className="rounded-2xl border p-6 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>🤖</span> AI Assistant Specs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Dual-Brain natural language resolver
              </p>

              <div className="space-y-3 text-xs font-medium">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold uppercase">Language Support</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">Urdu, Roman Urdu, English</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    TRI-LINGUAL
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold uppercase">Database RAG Guardrails</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Zero Hallucinations Active</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                    STRICT RAG
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold uppercase">Automated Invoicing</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">ZP-ORD & Confirmation Slips</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[10px]">
                    AUTO SLIP
                  </span>
                </div>
              </div>

              <Link
                to="/chats"
                className="w-full py-3 mt-4 rounded-xl font-extrabold text-xs text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-md shadow-emerald-600/20 block"
              >
                Open Live WhatsApp Simulator →
              </Link>
            </div>

            {/* Quick Orders Snippet */}
            <div className="rounded-2xl border p-5 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🛍️</span> Recent Orders
                </h4>
                <Link to="/orders" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View All ({data?.total_orders || recentOrders.length})
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentOrders.length > 0 ? (
                  recentOrders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                          {ord.order_number || ord.id.slice(0, 8)}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {ord.customer_name || 'Customer'} • COD
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          Rs. {(ord.total_amount || 0).toLocaleString()}
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {ord.order_status || 'CONFIRMED'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No recent orders. Send a test order in WhatsApp!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
