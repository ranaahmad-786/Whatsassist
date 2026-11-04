/**
 * WhatsAssist - Enterprise Login Screen
 * Supports Customer, Store Owner, and Store Manager logins.
 * Includes 1-click Demo Fill pills for immediate evaluation.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm] = useState({ email: 'ranaahmadkhan.112211@gmail.com', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Quick Demo Auto-Fill helpers
  const fillOwner = () => {
    setForm({ email: 'ranaahmadkhan.112211@gmail.com', password: '' });
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
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200 relative bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          type="button"
          className="px-4 py-2 rounded-xl border font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer bg-white border-slate-300 text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-amber-400 dark:hover:bg-slate-800"
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="rounded-3xl border shadow-2xl w-full max-w-md p-8 transition-all bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-800">
        {/* Header with Official Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="relative group">
              <img
                src={logoImg}
                alt="WhatsAssist Official Logo"
                className="w-72 max-w-full h-auto object-contain rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            WhatsAssist
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
            ZepTech Smart Electronics & E-Mobility Portal
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="mb-5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 text-center">
            Quick 1-Click Role Fill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillOwner}
              className="py-1.5 px-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>🏪</span> Owner Account
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="py-1.5 px-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>👤</span> Customer Account
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl text-xs font-semibold mb-5 bg-rose-50 border border-rose-300 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="e.g. owner@zeptech.pk or customer@gmail.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your account password"
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-600/25 cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Create Customer or Store Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
