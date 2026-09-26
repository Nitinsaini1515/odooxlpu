import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Armchair,
  ArrowLeftRight,
  ClipboardList,
  Building2,
  ShoppingCart,
  TrendingUp,
  CircleDollarSign,
  BrainCircuit,
  Boxes,
  X,
  Shield,
  User,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isManager, user } = useAuth();

  // Role-filtered navigation links (unauthorized links are completely hidden)
  const navLinks = isManager
    ? [
        { to: '/dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
        { to: '/products', label: 'Products & Catalog', icon: Armchair },
        { to: '/inventory/operations', label: 'Inventory Operations', icon: ArrowLeftRight, badge: 'In/Out' },
        { to: '/inventory/ledger', label: 'Stock Ledger', icon: ClipboardList },
        { to: '/warehouses', label: 'Warehouses & Matrix', icon: Building2 },
        { to: '/orders', label: 'Customer Orders', icon: ShoppingCart },
        { to: '/analytics/sales', label: 'Sales Analytics', icon: TrendingUp },
        { to: '/analytics/profit', label: 'Profit Analytics', icon: CircleDollarSign },
        { to: '/smart-insights', label: 'Smart Insights', icon: BrainCircuit, badge: 'AI' },
      ]
    : [
        { to: '/staff/dashboard', label: 'Staff Operations', icon: LayoutDashboard },
        { to: '/inventory/operations', label: 'Receipts & Transfers', icon: ArrowLeftRight, badge: 'Active' },
        { to: '/orders', label: 'Pick & Pack Orders', icon: ShoppingCart },
        { to: '/products', label: 'Warehouse Stock', icon: Armchair },
        { to: '/inventory/ledger', label: 'Stock Ledger', icon: ClipboardList },
        { to: '/warehouses', label: 'Location Matrix', icon: Building2 },
        { to: '/smart-insights', label: 'Stockout Alerts', icon: BrainCircuit },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-extrabold text-base tracking-tight">StockSense</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ERP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Furniture Inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isManager ? 'Manager ERP Menu' : 'Warehouse Staff Menu'}
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-300 border border-indigo-700/50">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer: User Role Card & Company Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {isManager ? <Shield className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Staff User'}</p>
              <p className="text-[10px] text-indigo-400 font-medium">
                {isManager ? 'Inventory Manager / Owner' : 'Warehouse Operations Staff'}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-3">
            StockSense • Jalandhar Central
          </p>
        </div>
      </aside>
    </>
  );
};
