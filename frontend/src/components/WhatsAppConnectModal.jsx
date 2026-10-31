/**
 * WhatsAssist - WhatsApp Baileys Multi-Device Connection Modal
 * Live QR Scanner, Pairing Code Generation, Device Telemetry & Test Dispatch.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  Copy,
  Send,
  Activity,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { whatsappAPI } from '../services/api';

export default function WhatsAppConnectModal({ isOpen, onClose }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'pairing' | 'test' | 'logs'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testTo, setTestTo] = useState('');
  const [testMsg, setTestMsg] = useState('Hello from WhatsAssist AI Agent!');
  const [testResult, setTestResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await whatsappAPI.getStatus();
      if (res.data?.success) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectQR = async () => {
    try {
      setActionLoading(true);
      await whatsappAPI.connect();
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestPairing = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      setActionLoading(true);
      await whatsappAPI.pair(phoneNumber);
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async (clearAuth = false) => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp?')) return;
    try {
      setActionLoading(true);
      await whatsappAPI.disconnect(clearAuth);
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testTo || !testMsg) return;
    try {
      setActionLoading(true);
      setTestResult(null);
      const res = await whatsappAPI.send(testTo, testMsg);
      setTestResult({ success: true, message: 'Message dispatched successfully!' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to dispatch message',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isConnected = statusData?.isConnected;
  const status = statusData?.status || 'DISCONNECTED';
  const qrDataUrl = statusData?.qrDataUrl;
  const pairingCode = statusData?.pairingCode;
  const user = statusData?.user;
  const stats = statusData?.stats;
  const logs = statusData?.logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  WhatsApp Device Integration
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : status === 'QR_READY'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500 animate-pulse'
                        : status === 'QR_READY'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-slate-400'
                    }`}
                  />
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Baileys Multi-Device Web Engine · Direct Personal/Business Phone Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              title="Refresh Status"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/40 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Link</span>
          </button>
          <button
            onClick={() => setActiveTab('pairing')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pairing'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pairing Code</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'test'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Test Outbound</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Logs ({logs.length})</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* If Connected Banner */}
          {isConnected && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{user?.name || 'WhatsAssist Merchant'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                      {user?.phone}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    WhatsApp is fully online! All customer incoming messages trigger Gemini AI auto-replies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDisconnect(false)}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-6 text-center">
              {isConnected ? (
                <div className="py-8 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                    <Wifi className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      Device Linked & Listening
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Your WhatsApp session is active. You can receive queries from customers and our AI will reply automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-semibold">Received</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {stats?.messagesReceived || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-semibold">Sent</div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {stats?.messagesSent || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 font-semibold">AI Answers</div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {stats?.aiReplies || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ) : qrDataUrl ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 rounded-2xl bg-white shadow-xl border border-slate-200 inline-block">
                    <img
                      src={qrDataUrl}
                      alt="WhatsApp QR Code"
                      className="w-56 h-56 rounded-xl object-contain"
                    />
                  </div>

                  <div className="max-w-md space-y-2">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Scan QR Code with WhatsApp
                    </h4>
                    <ol className="text-xs text-slate-600 dark:text-slate-400 text-left space-y-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <li>1. Open <strong>WhatsApp</strong> on your mobile phone</li>
                      <li>2. Tap <strong>Settings</strong> or <strong>Menu (⋮)</strong> &gt; <strong>Linked Devices</strong></li>
                      <li>3. Tap <strong>Link a Device</strong> and point your camera at this QR screen</li>
                      <li>4. Connection pairs automatically within 2 seconds!</li>
                    </ol>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleConnectQR}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                      Generate New QR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 space-y-5 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Ready to Link WhatsApp Account
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Click below to generate a multi-device QR code. Scan it directly from your WhatsApp phone application.
                    </p>
                  </div>

                  <button
                    onClick={handleConnectQR}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{actionLoading ? 'Generating QR...' : 'Start WhatsApp Connection & Show QR'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAIRING CODE */}
          {activeTab === 'pairing' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white block font-bold">
                    No camera or prefer code pairing?
                  </strong>
                  Enter your phone number with country code (e.g. 923314228724). WhatsApp will give you an 8-digit pairing code to enter on your phone!
                </div>
              </div>

              {pairingCode ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Your 8-Digit Pairing Code:
                  </div>
                  <div className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-white select-all">
                    {pairingCode}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors inline-flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <p className="text-[11px] text-slate-500">
                    Open WhatsApp &gt; Linked Devices &gt; Link with phone number instead, and enter this code.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestPairing} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (with Country Code)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 923314228724 or +923314228724"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading || !phoneNumber}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{actionLoading ? 'Requesting Code...' : 'Get WhatsApp Pairing Code'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TEST OUTBOUND MESSAGE */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                Send a real test WhatsApp message directly through your linked phone to verify end-to-end delivery.
              </div>

              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +923314228724"
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message Text
                  </label>
                  <textarea
                    rows={3}
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading || !testTo || !testMsg}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{actionLoading ? 'Sending...' : 'Dispatch Test WhatsApp'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1">
                <span>Recent WhatsApp Events</span>
                <span className="font-mono">{logs.length} logged packets</span>
              </div>
              <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2 border border-slate-800">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-center py-6">No WhatsApp activity events recorded yet.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5 last:border-none">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                          log.type === 'success'
                            ? 'bg-emerald-950 text-emerald-400'
                            : log.type === 'error'
                            ? 'bg-rose-950 text-rose-400'
                            : log.type === 'warn'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>End-to-End WhatsApp Web Protocol via Baileys</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
