/**
 * WhatsAssist - 4-Stage Repair Tracking Component
 * Wireframe-aligned interactive visual stepper for electronics & appliance repairs.
 *
 * Stages:
 * 1. RECEIVED
 * 2. IN DIAGNOSIS
 * 3. REPAIRING
 * 4. READY FOR PICKUP
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Truck,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Phone,
  Tag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { repairsAPI } from '../services/api';

const STAGES = [
  {
    key: 'RECEIVED',
    label: 'RECEIVED',
    title: 'Item Received',
    desc: 'Device logged at service desk',
    icon: CheckCircle2,
    color: 'emerald',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  {
    key: 'IN_DIAGNOSIS',
    label: 'IN DIAGNOSIS',
    title: 'In Diagnosis',
    desc: 'Hardware circuitry & faults inspection',
    icon: ShieldCheck,
    color: 'amber',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  {
    key: 'IN_PROGRESS',
    label: 'REPAIRING',
    title: 'Repairing',
    desc: 'Component replacement & PCB soldering',
    icon: Wrench,
    color: 'sky',
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
  {
    key: 'READY_FOR_PICKUP',
    label: 'READY FOR PICKUP',
    title: 'Ready for Pickup',
    desc: 'Burn-in tested, QC passed, ready for customer',
    icon: Truck,
    color: 'emerald',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
];

function getStageIndex(status) {
  if (!status) return 0;
  const s = status.toUpperCase();
  if (s.includes('PICKUP') || s.includes('READY')) return 3;
  if (s.includes('PROGRESS') || s.includes('REPAIR')) return 2;
  if (s.includes('DIAGNOS') || s.includes('INSPECT')) return 1;
  return 0; // RECEIVED
}

export default function RepairTracker({ className = '' }) {
  const [tokenInput, setTokenInput] = useState('REP-101');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repairData, setRepairData] = useState({
    token_number: 'REP-101',
    customer_name: 'Usman Tariq',
    customer_phone: '+923214567890',
    item_name: 'Gree 1.5 Ton Split AC Inverter PCB Board',
    issue_reported: 'Compressor tripping error E7 / no power on outdoor card',
    status: 'READY_FOR_PICKUP',
    estimated_cost: 3500,
    warranty_days: 30,
    technician_notes: 'Replaced primary filtering capacitor and relay switch. Burn-in tested for 2 hours under full 12A load.',
  });

  const handleTrack = async (overrideToken) => {
    const token = (overrideToken || tokenInput).trim().toUpperCase();
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const res = await repairsAPI.track(token);
      if (res.data?.success && res.data?.repair) {
        setRepairData(res.data.repair);
      } else {
        setError(`No active repair ticket found for token "${token}".`);
      }
    } catch (err) {
      console.warn('Live API track fallback:', err);
      // Fallback mock tokens for immediate offline inspection
      const mockDB = {
        'REP-101': {
          token_number: 'REP-101',
          customer_name: 'Usman Tariq',
          customer_phone: '+923214567890',
          item_name: 'Gree 1.5 Ton Split AC Inverter PCB Board',
          issue_reported: 'Compressor tripping error E7 / no power on outdoor card',
          status: 'READY_FOR_PICKUP',
          estimated_cost: 3500,
          warranty_days: 30,
          technician_notes: 'Replaced primary filtering capacitor and relay switch. Burn-in tested for 2 hours under full 12A load.',
        },
        'REP-102': {
          token_number: 'REP-102',
          customer_name: 'Dr. Hamza Sheikh',
          customer_phone: '+923335551234',
          item_name: 'Dawlance Convection Microwave Oven (30L)',
          issue_reported: 'Turntable rotating but food not heating / high-voltage diode inspection',
          status: 'IN_PROGRESS',
          estimated_cost: 3200,
          warranty_days: 30,
          technician_notes: 'Replaced high-voltage diode and capacitor. Verified heating cycle on 800W setting.',
        },
        'REP-103': {
          token_number: 'REP-103',
          customer_name: 'Ayesha Khan',
          customer_phone: '+923009876543',
          item_name: 'Dawlance Chrome Inverter Refrigerator',
          issue_reported: 'Upper freezer compartment cooling fine, lower food section warm',
          status: 'IN_DIAGNOSIS',
          estimated_cost: 2500,
          warranty_days: 30,
          technician_notes: 'Inspecting evaporator fan motor and automated bi-metal defrost sensor.',
        },
      };

      if (mockDB[token]) {
        setRepairData(mockDB[token]);
      } else {
        setError(err.response?.data?.message || `No active repair ticket found for token "${token}".`);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeStageIdx = getStageIndex(repairData?.status);

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${className}`}>
      {/* Header and Search Form */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
              <Wrench className="w-4 h-4" />
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              4-Stage Repair Tracking
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time status updates for electronics, inverter appliances & e-bike servicing.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="Enter Repair Token (e.g., REP-101)"
              className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </div>
      </div>

      {/* Quick Token Selector Pills */}
      <div className="flex items-center gap-2 mt-4 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-[11px] uppercase tracking-wider">Try Demo Tokens:</span>
        {['REP-101', 'REP-102', 'REP-103'].map((tok) => (
          <button
            key={tok}
            type="button"
            onClick={() => {
              setTokenInput(tok);
              handleTrack(tok);
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
              repairData?.token_number === tok
                ? 'bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {tok}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4-Stage Stepper Container */}
      <div className="mt-8 pt-4">
        <div className="relative">
          {/* Connecting Track Line */}
          <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
            <div
              className="h-full bg-slate-900 dark:bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${(activeStageIdx / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPassed = idx < activeStageIdx;
              const isCurrent = idx === activeStageIdx;
              const isUpcoming = idx > activeStageIdx;

              return (
                <div key={stage.key} className="relative flex flex-col items-center text-center group">
                  {/* Arrow connector to next stage (wireframe style) */}
                  {idx < STAGES.length - 1 && (
                    <div className="hidden sm:flex absolute top-4 -right-2 text-slate-300 dark:text-slate-600 items-center justify-center pointer-events-none z-20">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  {/* Circle Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-900/10 dark:bg-emerald-500 dark:text-slate-950 dark:ring-emerald-500/30 scale-110 font-bold'
                        : isPassed
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                        isCurrent
                          ? 'text-slate-900 dark:text-emerald-400 font-black'
                          : isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-[130px]">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Ticket Details Card */}
      {repairData && (
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300">
                  {repairData.token_number}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {repairData.customer_name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({repairData.customer_phone})
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                {repairData.item_name}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 uppercase tracking-wide">
                {repairData.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Reported Fault</p>
              <p className="text-slate-800 dark:text-slate-200 mt-1 font-medium">{repairData.issue_reported}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Technician Service Log</p>
              <p className="text-slate-800 dark:text-slate-200 mt-1 font-medium">{repairData.technician_notes || 'Under standard diagnosis bench'}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Estimated Cost & Warranty</p>
              <p className="text-slate-800 dark:text-slate-200 mt-1 font-semibold">
                Rs. {Number(repairData.estimated_cost || 0).toLocaleString()} • {repairData.warranty_days || 30} Days Post-Repair Warranty
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
