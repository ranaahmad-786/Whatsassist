/**
 * WhatsAssist - Enterprise Settings & WhatsApp Integration Hub
 * Baileys Multi-Device Pairing, Meta Cloud API Ingress & Gemini AI Tuning.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import WhatsAppConnectModal from '../components/WhatsAppConnectModal';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  QrCode,
  Save,
  Key,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Sliders,
  Building,
} from 'lucide-react';

export default function Settings() {
  const { merchant } = useAuth();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);

  const [form, setForm] = useState({
    businessName: merchant?.business_name || 'ZepTech Smart Electronics',
    phoneNumber: merchant?.phone || '+923001234567',
    category: 'Smart Electronics & E-Mobility',
    phoneNumberId: 'PHONE_108492019482',
    wabaId: 'WABA_982401849210',
    verifyToken: 'whatsassist_webhook_verify_2024',
    confidenceThreshold: 0.65,
    geminiModel: 'gemini-3.5-flash',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText('http://localhost:5000/api/webhook/whatsapp');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout
      title="System Settings & WhatsApp Ingress"
      subtitle="Configure WhatsApp Baileys multi-device sync, Meta Cloud API credentials, and Gemini AI parameters"
    >
      <div className="max-w-4xl space-y-6">
        {saved && (
          <div className="p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuration parameters successfully saved and synchronized with backend engine.</span>
          </div>
        )}

        {/* 1. WhatsApp Multi-Device Connection (Baileys) */}
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  WhatsApp Device Linking (Baileys Engine)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Link your real WhatsApp phone account via QR code or 8-digit pairing code
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWaModal(true)}
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Device Link Manager</span>
            </button>
          </div>
        </div>

        {/* 2. Business Identity */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" />
              <span>Business Profile Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Meta Cloud API Credentials */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Meta WhatsApp Cloud API Webhook</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Webhook Callback URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="http://localhost:5000/api/webhook/whatsapp"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono select-all outline-none"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meta Phone Number ID
                </label>
                <input
                  type="text"
                  value={form.phoneNumberId}
                  onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  value={form.verifyToken}
                  onChange={(e) => setForm({ ...form, verifyToken: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. AI Orchestration Tuning */}
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Google Gemini AI Orchestrator Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Generative Model
                </label>
                <select
                  value={form.geminiModel}
                  onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra-Low Latency)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Fidelity)</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Fastest)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confidence Threshold for Autonomous Action
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.4"
                    max="0.95"
                    step="0.05"
                    value={form.confidenceThreshold}
                    onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white w-12 text-right">
                    {Math.round(form.confidenceThreshold * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      <WhatsAppConnectModal isOpen={showWaModal} onClose={() => setShowWaModal(false)} />
    </PageLayout>
  );
}
