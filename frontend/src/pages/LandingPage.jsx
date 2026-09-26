import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Shield,
  User,
  ArrowRight,
  TrendingUp,
  Building2,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Package,
  Layers,
  Flame,
  Truck,
  Armchair,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isManager, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md sticky top-0 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-xl tracking-tight">StockSense</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Furniture Inventory Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Engineered for High-End Furniture Manufacturers & Retailers</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Intelligent Inventory & Multi-Warehouse Operations for <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">StockSense Furniture</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          From solid teak dining sets to luxury Chesterfield velvet sofas, unify cross-warehouse stock matrices, automated pick & pack fulfillment, immutable audit ledgers, and profit analytics in one responsive system.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <span>Launch Live ERP Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-bold rounded-xl transition flex items-center gap-2"
          >
            <span>Register Business Staff</span>
          </Link>
        </div>

        {/* Metric Highlights Bar */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 text-left">
            <span className="text-2xl font-black text-white">3 Hubs</span>
            <p className="text-xs text-slate-400 mt-0.5">Jalandhar, Model Town, Amritsar</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 text-left">
            <span className="text-2xl font-black text-indigo-400">100%</span>
            <p className="text-xs text-slate-400 mt-0.5">Audited Stock Ledger</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 text-left">
            <span className="text-2xl font-black text-emerald-400">₹5,19k+</span>
            <p className="text-xs text-slate-400 mt-0.5">Net Profit Tracked</p>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 text-left">
            <span className="text-2xl font-black text-amber-400">Predictive</span>
            <p className="text-xs text-slate-400 mt-0.5">Burn-Rate Stockout Alerts</p>
          </div>
        </div>
      </section>

      {/* Role-Based Architecture Section */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
              Role-Based Access Control
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tailored Portals for Managers and Warehouse Staff
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
              Each user operates within strict security boundaries enforced at both the JWT authentication layer and frontend routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Manager Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-amber-500/30 relative overflow-hidden shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Executive Access
              </span>
              <h4 className="text-lg font-bold text-white mt-2">Inventory Manager / Owner</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Complete oversight over business performance, revenue trajectories, and inventory health.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Full 8-metric Dashboard with MoM Growth & Area Charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Sales & Net Profit Analytics with Unit COGS Margins
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Catalog Management (Create, Edit & Delete Furniture)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Smart Reorder Engine & Dead-Stock Capital Detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Multi-Warehouse Capacity Configuration
                </li>
              </ul>
            </div>

            {/* Warehouse Staff Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-emerald-500/30 relative overflow-hidden shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Operational Floor Access
              </span>
              <h4 className="text-lg font-bold text-white mt-2">Warehouse Staff</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dedicated operational dashboard focused on warehouse tasks without exposure to financial figures.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Receive Inward Stock Shipments & Auto-Update Balances
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Pick & Pack Queue for Customer Sales Orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Execute Internal Transfers Between Locations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Perform Physical Cycle Counts & Variance Adjustments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Cross-Warehouse Stock Matrix Lookup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
            Enterprise Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Every Stage of the Furniture Lifecycle
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Multi-Warehouse Matrix</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track stock levels across the Main Jalandhar Hub, Model Town Showroom, and regional bays with location-specific aisle tagging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">4-Way Inventory Operations</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Handle supplier Receipts, outgoing Deliveries, zero-loss Internal Transfers, and physical Cycle Count Adjustments seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Immutable Stock Ledger</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every unit movement generates an audit record documenting exact deltas, balance after, reference number, user, and timestamp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Predictive Stockout Alerts</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time daily burn rate formulas forecast estimated runout dates for high-demand furniture lines before inventory runs dry.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Unit-Level Profit Analytics</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Analyze true gross margin by contrasting wholesale purchase pricing with retail customer selling prices across monthly trends.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/60 transition group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Order Pick & Pack Pipeline</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track customer orders through Pending, Confirmed, Ready (Packed), and Delivered with automated stock reservation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-300 text-sm">StockSense ERP</span>
        </div>
        <p>© 2026 StockSense Furniture Ltd • Jalandhar Industrial Focal Point, Punjab</p>
        <p className="text-slate-600 mt-1">Full-stack React, Tailwind CSS, Node.js, Express & MongoDB Architecture</p>
      </footer>
    </div>
  );
};
