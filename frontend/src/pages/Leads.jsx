/**
 * WhatsAssist - Enterprise CRM Leads Pipeline
 * Glassmorphic Lead Cards, Responsive Tables, Status Badges & CSV Export.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { leadsAPI } from '../services/api';
import {
  Users,
  Download,
  Search,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await leadsAPI.getLeads();
      if (res.data.success) {
        setLeads(res.data.leads);
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      loadLeads();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Customer Name', 'Phone Number', 'Lead Type', 'Status', 'Date'];
    const rows = leads.map((l) => [
      `"${l.customer_name}"`,
      `"${l.whatsapp_phone}"`,
      `"${l.lead_type}"`,
      `"${l.status}"`,
      `"${new Date(l.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsassist_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);

  return (
    <PageLayout
      title="High-Intent WhatsApp CRM Leads"
      subtitle="Autonomous customer qualification from WhatsApp queries: orders, quotes & repair bookings"
      actions={
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Filter Pills Header */}
        <div className="glass-card p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black">
            {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  filter === st
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {st} {st === 'ALL' ? `(${leads.length})` : ''}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-bold shrink-0">
            {filteredLeads.length} Qualified Opportunities
          </div>
        </div>

        {/* Leads Table Container with Horizontal Scroll Protection */}
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Intent Type</th>
                  <th className="p-4">Extracted Details</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-xs">No leads found in this filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 pl-6 font-extrabold text-slate-900 dark:text-white">
                        {l.customer_name}
                      </td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                        {l.whatsapp_phone}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
                          {l.lead_type || 'INQUIRY'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {l.extracted_details || 'Recorded from live conversation'}
                      </td>
                      <td className="p-4">
                        <select
                          value={l.status}
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none"
                        >
                          <option value="NEW">New Lead</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="CONVERTED">Converted</option>
                        </select>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <a
                          href={`https://wa.me/${l.whatsapp_phone?.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] shadow-sm inline-flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
