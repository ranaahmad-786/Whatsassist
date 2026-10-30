/**
 * WhatsAssist - Orders & Repair Tracking Management
 * Glassmorphic Status Panels, 4-Stage Repair Stepper & Token Diagnostic Lookup.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { ordersAPI, repairsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Wrench,
  Search,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  Phone,
  User,
  MapPin,
} from 'lucide-react';

export default function Orders() {
  const { merchant } = useAuth();
  const isCustomer = merchant?.role === 'customer';

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'repairs'
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_orders: 0, total_revenue: 0, pending_orders: 0, delivered_orders: 0 });

  // Customer Token Search
  const [tokenSearch, setTokenSearch] = useState('');

  // Add Repair Modal State (Owner/Manager)
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairForm, setRepairForm] = useState({
    customer_name: '',
    customer_phone: '',
    item_name: '',
    issue_reported: '',
    estimated_cost: '',
    warranty_days: 30,
    technician_notes: '',
  });
  const [savingRepair, setSavingRepair] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderRes, repairRes] = await Promise.all([
        ordersAPI.getAll(),
        repairsAPI.getAll(),
      ]);
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders);
        setSummary(orderRes.data.summary);
      }
      if (repairRes.data.success) {
        setRepairs(repairRes.data.repairs);
      }
    } catch (err) {
      console.error('Failed to load orders/repairs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
    } catch (err) {
      console.error('Update order status failed:', err);
    }
  };

  const handleUpdateRepairStatus = async (repairId, newStatus) => {
    try {
      await repairsAPI.update(repairId, { status: newStatus });
      setRepairs((prev) => prev.map((r) => (r.id === repairId ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error('Update repair status failed:', err);
    }
  };

  const handleCreateRepair = async (e) => {
    e.preventDefault();
    setSavingRepair(true);
    try {
      const tokenNumber = `REP-${Math.floor(100 + Math.random() * 900)}`;
      await repairsAPI.create({
        ...repairForm,
        token_number: tokenNumber,
        estimated_cost: Number(repairForm.estimated_cost),
        warranty_days: Number(repairForm.warranty_days),
      });
      setShowRepairModal(false);
      setRepairForm({
        customer_name: '',
        customer_phone: '',
        item_name: '',
        issue_reported: '',
        estimated_cost: '',
        warranty_days: 30,
        technician_notes: '',
      });
      await loadData();
    } catch (err) {
      console.error('Create repair failed:', err);
    } finally {
      setSavingRepair(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await ordersAPI.delete(orderId);
      await loadData();
    } catch (err) {
      console.error('Delete order failed:', err);
    }
  };

  const handleDeleteRepair = async (repairId) => {
    if (!window.confirm('Delete this repair ticket?')) return;
    try {
      await repairsAPI.delete(repairId);
      await loadData();
    } catch (err) {
      console.error('Delete repair failed:', err);
    }
  };

  const stages = [
    { key: 'RECEIVED', label: '1. Received' },
    { key: 'DIAGNOSING', label: '2. Diagnosing' },
    { key: 'IN_PROGRESS', label: '3. In Progress' },
    { key: 'READY_FOR_PICKUP', label: '4. Ready' },
  ];

  const getStageIndex = (status) => {
    return stages.findIndex((s) => s.key === status);
  };

  const filteredRepairs = tokenSearch.trim()
    ? repairs.filter(
        (r) =>
          r.token_number.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          (r.customer_name && r.customer_name.toLowerCase().includes(tokenSearch.toLowerCase())) ||
          (r.customer_phone && r.customer_phone.includes(tokenSearch))
      )
    : repairs;

  return (
    <PageLayout
      title={isCustomer ? 'My Orders & Device Repair Status' : 'Orders & Diagnostics Workbench'}
      subtitle={
        isCustomer
          ? 'Track real-time delivery status or lookup your device repair diagnostic token'
          : 'Customer purchase fulfillment, Cash on Delivery stages, and 4-step repair tokens'
      }
      actions={
        !isCustomer && (
          <button
            onClick={() => setShowRepairModal(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md shadow-amber-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Repair Ticket</span>
          </button>
        )
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('repairs')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'repairs'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Repair Tokens ({repairs.length})</span>
            </button>
          </div>

          {activeTab === 'repairs' && (
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search token (e.g. REP-101)..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* =========================================================================
            TAB 1: ORDERS LIST
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-20 text-center text-slate-400 glass-card rounded-3xl border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No orders placed yet</h4>
                <p className="text-xs text-slate-500 mt-1">Orders placed via WhatsApp AI will appear here in real time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((o) => {
                  const statusColors = {
                    CONFIRMED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    DISPATCHED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    DELIVERED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                  };

                  return (
                    <div
                      key={o.id}
                      className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {o.order_code}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                              {o.customer_name}
                            </h4>
                          </div>

                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              statusColors[o.order_status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {o.order_status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                          {o.items?.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between font-medium">
                              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                                {it.title} × {it.quantity || 1}
                              </span>
                              <span className="font-mono text-slate-600 dark:text-slate-400 font-bold">
                                Rs. {Number(it.price).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Customer & Address Details */}
                        <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{o.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{o.delivery_address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-black">Total Bill (COD)</div>
                          <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                            Rs. {Number(o.total_amount).toLocaleString()}
                          </div>
                        </div>

                        {!isCustomer && (
                          <div className="flex items-center gap-2">
                            <select
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                            >
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="DISPATCHED">Dispatched</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: REPAIR DIAGNOSTICS & TOKENS
           ========================================================================= */}
        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {filteredRepairs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 glass-card rounded-3xl border border-slate-200 dark:border-slate-800">
                <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No repair tickets found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Lookup by token (e.g. REP-101) or create a new repair ticket.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRepairs.map((r) => {
                  const currentIdx = getStageIndex(r.status);

                  return (
                    <div
                      key={r.id}
                      className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                                {r.token_number}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {r.warranty_days}-Day Service Warranty
                              </span>
                            </div>
                            <h4 className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                              {r.item_name}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] uppercase font-black text-slate-400">Estimated Cost</div>
                          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            Rs. {Number(r.estimated_cost).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* 4-Stage Visual Diagnostic Stepper */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="text-[10px] uppercase font-black text-slate-400">
                          Live Technician Progress Pipeline:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {stages.map((stg, idx) => {
                            const isDone = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div
                                key={stg.key}
                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                  isCurrent
                                    ? 'bg-amber-500 text-white border-amber-600 font-black shadow-md shadow-amber-500/20'
                                    : isDone
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold'
                                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <div className="text-xs">{stg.label}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Details & Technician Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 font-bold block mb-1">Reported Fault:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{r.issue_reported}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 font-bold block mb-1">Technician Log:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 italic">
                            "{r.technician_notes || 'Device under routine inspection.'}"
                          </span>
                        </div>
                      </div>

                      {/* Ticket Footer Actions */}
                      {!isCustomer && (
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div className="text-slate-400">
                            Customer: <strong>{r.customer_name}</strong> ({r.customer_phone})
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={r.status}
                              onChange={(e) => handleUpdateRepairStatus(r.id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                            >
                              <option value="RECEIVED">1. Received</option>
                              <option value="DIAGNOSING">2. Diagnosing</option>
                              <option value="IN_PROGRESS">3. In Progress</option>
                              <option value="READY_FOR_PICKUP">4. Ready For Pickup</option>
                            </select>
                            <button
                              onClick={() => handleDeleteRepair(r.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Repair Ticket Modal */}
      {showRepairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <span>Issue New Repair Ticket Token</span>
              </h3>
              <button onClick={() => setShowRepairModal(false)} className="text-slate-400 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateRepair} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={repairForm.customer_name}
                    onChange={(e) => setRepairForm({ ...repairForm, customer_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    required
                    value={repairForm.customer_phone}
                    onChange={(e) => setRepairForm({ ...repairForm, customer_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Electronic Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haier 1.5 Ton Inverter AC (PCB Fault)"
                  value={repairForm.item_name}
                  onChange={(e) => setRepairForm({ ...repairForm, item_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Reported by Customer</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Outdoor unit fan not spinning, error E7 on display"
                  value={repairForm.issue_reported}
                  onChange={(e) => setRepairForm({ ...repairForm, issue_reported: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Cost (PKR)</label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={repairForm.estimated_cost}
                    onChange={(e) => setRepairForm({ ...repairForm, estimated_cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Warranty (Days)</label>
                  <input
                    type="number"
                    value={repairForm.warranty_days}
                    onChange={(e) => setRepairForm({ ...repairForm, warranty_days: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRepairModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRepair}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md"
                >
                  {savingRepair ? 'Issuing Ticket...' : 'Issue Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
