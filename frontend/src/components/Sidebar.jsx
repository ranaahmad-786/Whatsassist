/**
 * WhatsAssist - Enterprise Workstation Sidebar Navigation
 * Dynamic role-based navigation for Customer and Store Owner / Manager accounts.
 * Supports Dark/Light theme switching, active route tracking, and user profile.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.jpg';

export default function Sidebar() {
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
        { name: 'Store & Products', path: '/products', icon: '⚡', badge: 'Catalog' },
        { name: 'My Orders & Repairs', path: '/orders', icon: '📦', badge: 'Live' },
        { name: 'AI WhatsApp Chat', path: '/chats', icon: '💬', badge: 'Bot' },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: '📊', badge: null },
        { name: 'Products & Stock', path: '/products', icon: '📦', badge: 'Catalog' },
        { name: 'Live WhatsApp', path: '/chats', icon: '💬', badge: 'Live' },
        { name: 'Orders & Repairs', path: '/orders', icon: '🏷️', badge: 'Orders' },
        { name: 'Knowledge Base', path: '/knowledge', icon: '📚', badge: null },
        { name: 'Leads & CRM', path: '/leads', icon: '👥', badge: 'Auto' },
        { name: 'Settings', path: '/settings', icon: '⚙️', badge: null },
      ];

  const roleLabel = isCustomer
    ? 'CUSTOMER'
    : (merchant?.role === 'manager' ? 'MANAGER' : 'OWNER');

  return (
    <aside className="w-64 flex flex-col h-screen border-r select-none transition-colors duration-200 bg-white border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="WhatsAssist Logo"
            className="w-11 h-11 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-md"
          />
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              WhatsAssist
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                {isCustomer ? 'SHOP' : 'AI'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              {isCustomer ? 'Customer Storefront' : 'ZepTech Workstation'}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Switcher Pill in Sidebar */}
      <div className="px-4 pt-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-slate-950/80 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <span>{isDark ? '🌙' : '☀️'}</span>
            <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Switch
          </span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Merchant Profile Footer */}
      <div className="p-4 border-t border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate pr-2">
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {merchant?.name || merchant?.business_name || (isCustomer ? 'Customer' : 'ZepTech')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{merchant?.email}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
            isCustomer
              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
          }`}>
            {roleLabel}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-500/20 cursor-pointer"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
