/**
 * WhatsAssist - Wireframe-Aligned Storefront Header & Navigation
 * Includes ZepTech branding, category shortcuts, search, profile pill, and cart badge.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  LogOut,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function StorefrontNavbar({
  cartCount = 1,
  onOpenCart,
  onSearchChange,
  searchQuery = '',
  onSelectCategory,
  activeCategory = 'All',
  onOpenOwnerView,
}) {
  const { merchant, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isOwner = merchant?.role === 'owner' || merchant?.role === 'admin';

  const navLinks = [
    { label: 'Shop', category: 'All' },
    { label: 'E-Bikes', category: 'E-Bikes' },
    { label: 'Appliances', category: 'Appliances' },
    { label: 'Smart TVs', category: 'LED TVs' },
    { label: 'Support', category: 'Support' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand Logo matching wireframe [Z] ZepTech */}
          <div className="flex items-center gap-3">
            <Link to="/products" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-lg tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                Z
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  ZepTech
                </span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  Smart Electronics
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.category === 'Support'
                  ? false
                  : activeCategory === link.category;

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    if (link.category === 'Support') {
                      const el = document.getElementById('repair-tracker-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else if (onSelectCategory) {
                      onSelectCategory(link.category);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons matching Wireframe */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Input / Icon */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full pl-3 pr-2 py-1">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    placeholder="Search appliances, e-bikes..."
                    className="w-36 sm:w-48 text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Search Catalog"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Owner Workstation Switcher */}
            {isOwner && onOpenOwnerView && (
              <button
                onClick={onOpenOwnerView}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Workstation</span>
              </button>
            )}

            {/* Profile Dropdown / User Info */}
            <div className="flex items-center gap-1">
              <Link
                to="/settings"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Logged in as ${merchant?.name || 'Customer'}`}
              >
                <User className="w-4 h-4" />
              </Link>
            </div>

            {/* Shopping Cart with Badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                if (link.category === 'Support') {
                  const el = document.getElementById('repair-tracker-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else if (onSelectCategory) {
                  onSelectCategory(link.category);
                }
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.label}
            </button>
          ))}
          {isOwner && (
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              Switch to Owner Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
