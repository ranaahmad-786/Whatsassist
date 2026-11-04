/**
 * WhatsAssist - Enterprise Registration Screen
 * Allows creating either a Customer Account or a Store Owner / Manager Account.
 * Supports Light & Dark themes with instant session provisioning.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.jpg';
import loginBg from '../assets/login-bg.jpg';

const BUSINESS_CATEGORIES = [
  'Electronics, E-Bikes & Household Appliances',
  'Retail & Departmental Store',
  'Home & Kitchen Appliances',
  'Solar & Inverter Solutions',
  'Software & IT Services',
  'Other',
];

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Account Type: 'customer' or 'business'
  const [accountType, setAccountType] = useState('customer');

  const [form, setForm] = useState({
    name: '',
    business_name: 'ZepTech Electronics',
    role: 'owner', // 'owner' or 'manager'
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    business_category: 'Electronics, E-Bikes & Household Appliances',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const payload = {
        account_type: accountType,
        role: accountType === 'customer' ? 'customer' : form.role,
        name: accountType === 'customer' ? form.name : form.business_name,
        business_name: accountType === 'customer' ? form.name : form.business_name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        business_category: accountType === 'customer' ? 'Customer' : form.business_category,
      };

      const res = await authAPI.signup(payload);
      login(res.data.token, res.data.merchant);

      if (accountType === 'customer') {
        navigate('/products');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
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
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-900/85 to-emerald-950/75 backdrop-blur-[3px]" />
      
      {/* Decorative Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Live Badge & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-emerald-500/30 backdrop-blur-md text-xs font-semibold text-emerald-400 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span>WhatsAssist Registration Portal</span>
        </div>

        <button
          onClick={toggleTheme}
          type="button"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="px-4 py-2 rounded-xl border font-bold text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer bg-slate-900/80 border-slate-700/80 text-white hover:bg-slate-800 backdrop-blur-md"
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="relative z-10 rounded-3xl border shadow-2xl w-full max-w-lg p-8 sm:p-9 transition-all bg-slate-900/80 dark:bg-slate-900/85 backdrop-blur-2xl border-white/10 dark:border-slate-800 text-white my-16 shadow-emerald-950/40">
        {/* Header with Circular Official Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/20 group-hover:ring-emerald-400/50 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-white/30 shadow-inner">
                  <img
                    src={logoImg}
                    alt="WhatsAssist Official Logo"
                    className="w-full h-full object-cover scale-125 transform transition-transform duration-500 group-hover:scale-135"
                  />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 border-2 border-slate-900 shadow-lg uppercase tracking-wider">
                JOIN
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-xs text-emerald-400 mt-1 font-bold tracking-wide uppercase">
            WhatsAssist Enterprise Customer & Store Portal
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="mb-6 p-1.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'customer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👤</span>
            <span>Customer Account</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('business')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              accountType === 'business'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏪</span>
            <span>Owner / Manager</span>
          </button>
        </div>

        {/* Description Pill */}
        <div className="mb-5 p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 flex items-center gap-2">
          <span>{accountType === 'customer' ? '🛍️' : '⚙️'}</span>
          <span>
            {accountType === 'customer'
              ? 'Register as Customer: Shop E-Bikes, Ovens & ACs, track WhatsApp orders, and lookup repair status.'
              : 'Register as Business: Access Admin Workstation, product inventory CRUD, analytics, and bot controls.'}
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl text-xs font-semibold mb-6 bg-rose-50 border border-rose-300 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Fields */}
          {accountType === 'customer' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Hamza Malik"
                className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
          ) : (
            /* Business / Manager Fields */
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Store / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. ZepTech Electronics"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Management Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="owner">Store Owner</option>
                    <option value="manager">Store Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    name="business_category"
                    value={form.business_category}
                    onChange={handleChange}
                    className="w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white cursor-pointer"
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={accountType === 'customer' ? 'e.g. hamza@gmail.com' : 'e.g. manager@zeptech.pk'}
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp / Mobile Number
            </label>
            <input
              type="tel"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+92 331 4228724"
              className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min 6 chars"
                className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-type"
                className="w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-slate-300 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-600/25 cursor-pointer mt-2"
          >
            {loading ? 'Creating Account...' : (accountType === 'customer' ? 'Register as Customer' : 'Register Store Account')}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Sign In to Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
