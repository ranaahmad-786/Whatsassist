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
import logoImg from '../assets/logo.jpg';
import loginBg from '../assets/login-bg.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: 'ranaahmadkhan.112211@gmail.com', password: 'admin123' });
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
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Cinematic AI WhatsApp Background Wallpaper with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      {/* Gradient Ambient Overlays for Deep Contrast */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-900/80 to-emerald-950/70 backdrop-blur-[3px]" />
      
      {/* Decorative Neon Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Live Badge */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-emerald-500/30 backdrop-blur-md text-xs font-semibold text-emerald-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>WhatsAssist Autonomous Brain Live</span>
        </div>
      </div>

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 rounded-3xl border shadow-2xl w-full max-w-md p-8 sm:p-9 transition-all bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-2xl border-white/10 dark:border-slate-800 text-white shadow-emerald-950/40">
        {/* Header with Circular 3D Metallic Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group cursor-pointer">
              {/* Outer Circular Gradient Ring */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/20 group-hover:ring-emerald-400/50 transition-all duration-300">
                {/* Circular Mask for Logo */}
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-white/30 shadow-inner">
                  <img
                    src={logoImg}
                    alt="WhatsAssist Official Logo"
                    className="w-full h-full object-cover scale-125 transform transition-transform duration-500 group-hover:scale-135"
                  />
                </div>
              </div>
              {/* Active Badge on Circle */}
              <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 border-2 border-slate-900 shadow-lg uppercase tracking-wider">
                v2.0
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            WhatsAssist
          </h1>
          <p className="text-xs text-emerald-400 mt-1 font-bold tracking-wide uppercase">
            WhatsApp AI Customer Resolution Agent
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ZepTech Smart Electronics & E-Mobility Portal
          </p>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="mb-5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 text-center">
            ⚡ Quick 1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillOwner}
              className="py-2 px-2.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-850 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>🏪</span> Owner Account
            </button>
            <button
              type="button"
              onClick={fillCustomer}
              className="py-2 px-2.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-850 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>👤</span> Customer Account
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl text-xs font-semibold mb-5 bg-rose-500/15 border border-rose-500/40 text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="e.g. owner@zeptech.pk or customer@gmail.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter your account password"
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all text-sm shadow-xl shadow-emerald-600/30 cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <span>→</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 font-bold hover:underline">
              Create Customer or Store Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
