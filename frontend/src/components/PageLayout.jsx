/**
 * WhatsAssist - Enterprise Glassmorphic Page Layout Scaffold
 * Responsive Mobile Drawer, Glassmorphic Sticky Top Bar, and WhatsApp Device Modal.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import WhatsAppConnectModal from './WhatsAppConnectModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Sun, Moon, QrCode, Wifi, Smartphone, Sparkles } from 'lucide-react';
import { whatsappAPI } from '../services/api';

export default function PageLayout({ children, title, subtitle, actions }) {
  const { isDark, toggleTheme } = useTheme();
  const { merchant } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [waStatus, setWaStatus] = useState('DISCONNECTED');

  useEffect(() => {
    let mounted = true;
    const checkWa = async () => {
      try {
        const res = await whatsappAPI.getStatus();
        if (mounted && res.data?.success) {
          setWaConnected(Boolean(res.data.data.isConnected));
          setWaStatus(res.data.data.status || 'DISCONNECTED');
        }
      } catch (e) {}
    };
    checkWa();
    const interval = setInterval(checkWa, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-screen font-sans antialiased overflow-hidden bg-slate-100 dark:bg-[#0b141a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenWhatsAppModal={() => setWaModalOpen(true)}
      />

      {/* Main Workspace Column */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-100/90 dark:bg-[#0b141a]">
        {/* Sticky Glassmorphic Top Bar */}
        <header className="px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-colors duration-200 bg-white/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              {title && (
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}

            {/* WhatsApp Integration Status Button */}
            <button
              onClick={() => setWaModalOpen(true)}
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer shadow-sm ${
                waConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Click to manage WhatsApp Web device connection"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  waConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                }`}
              />
              <span className="hidden sm:inline">
                {waConnected ? 'WhatsApp Online' : 'Link WhatsApp'}
              </span>
              <QrCode className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Dark / Light Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* WhatsApp Device Connection Modal */}
      <WhatsAppConnectModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
      />
    </div>
  );
}
