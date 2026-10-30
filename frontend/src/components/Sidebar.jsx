/**
 * WhatsAssist - Enterprise Glassmorphic Workstation Sidebar Navigation
 * Responsive Mobile Drawer + Desktop Sidebar with Lucide Icons and Live WhatsApp Status.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingBag,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Zap,
  QrCode,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ mobileOpen = false, onClose = () => {}, onOpenWhatsAppModal = () => {} }) {
  const { merchant, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCustomer = merchant?.role === 'customer';

  const navItems = isCustomer
    ? [
        { name: 'Store & Products', path: '/products', icon: Package, badge: 'Catalog' },
        { name: 'My Orders & Repairs', path: '/orders', icon: ShoppingBag, badge: 'Live' },
        { name: 'AI WhatsApp Chat', path: '/chats', icon: MessageSquare, badge: 'Bot' },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
        { name: 'Products & Stock', path: '/products', icon: Package, badge: 'Catalog' },
        { name: 'Live WhatsApp', path: '/chats', icon: MessageSquare, badge: 'AI Live' },
        { name: 'Orders & Repairs', path: '/orders', icon: ShoppingBag, badge: 'Orders' },
        { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen, badge: null },
        { name: 'Leads & CRM', path: '/leads', icon: Users, badge: 'Auto' },
        { name: 'Settings', path: '/settings', icon: Settings, badge: null },
      ];

  const roleLabel = isCustomer
    ? 'CUSTOMER'
    : (merchant?.role === 'manager' ? 'MANAGER' : 'OWNER');

  const content = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                WhatsAssist
              </h1>
              <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                {isCustomer ? 'SHOP' : 'AI'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[140px]">
              {isCustomer ? 'Customer Storefront' : (merchant?.business_name || 'ZepTech Workstation')}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* WhatsApp Link Quick Widget */}
      <div className="p-3">
        <button
          onClick={onOpenWhatsAppModal}
          type="button"
          className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/25 hover:border-emerald-500/50 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>WhatsApp Sync</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Scan QR / Pair Device
              </div>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white group-hover:bg-emerald-500 transition-colors shadow-sm">
            Link
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 dark:bg-slate-800 text-current border border-white/10">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Switcher & User Profile Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
        <button
          onClick={toggleTheme}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <span className="flex items-center gap-2">
            {isDark ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Toggle
          </span>
        </button>

        {/* User Card */}
        <div className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
              {(merchant?.name || merchant?.business_name || 'U')[0].toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                {merchant?.name || merchant?.business_name || 'Merchant User'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                {roleLabel}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-screen border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-Over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl z-10 flex flex-col border-r border-slate-200 dark:border-slate-800">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
