/**
 * WhatsAssist - Enterprise Glassmorphic Login Screen
 * Multi-Role Authentication with Ambient Orbs, 1-Click Demo Credentials & Lucide Icons.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Lock,
  Mail,
  Zap,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  User,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    email: 'ranaahmadkhan.112211@gmail.com',
    password: 'admin123',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Quick Demo Auto-Fill helpers
  const fillOwner = () => {
    setForm({ email: 'ranaahmadkhan.112211@gmail.com', password: 'admin123' });
    setError('');
  };

  const fillCustomer = () => {
    setForm({ email: 'customer@zeptech.pk', password: 'customer123' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const user = res.data.merchant;
      login(res.data.token, user);

      if (user?.role === 'customer') {
        navigate('/products');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-100 dark:bg-[#0b141a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Ambient Glowing Background Orbs for Glassmorphism */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-ambient" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl pointer-events-none animate-ambient" />

      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 sm:px-4 sm:py-2 rounded-2xl border font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 text-slate-800 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="w-full max-w-md relative z-10 glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/30">
            <Zap className="w-7 h-7 fill-white" />
          </div>
          <h1 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            WhatsAssist
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
            Autonomous WhatsApp AI Customer Resolution Agent for ZepTech Smart Electronics
          </p>
        </div>

        {/* 1-Click Demo Fill Badges */}
        <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2 text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            1-Click Demo Evaluation Profiles:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={fillOwner}
              className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Store Owner</span>
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Shopper</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@business.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to WhatsAssist'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-black text-emerald-600 dark:text-emerald-400 hover:underline">
            Register Business / Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
