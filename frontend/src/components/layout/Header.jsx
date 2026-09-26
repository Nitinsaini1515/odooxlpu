import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import { api } from '../../api/client';
import { NotificationDrawer } from './NotificationDrawer';
import {
  Building2,
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  User,
} from 'lucide-react';

export const Header = ({ toggleSidebar }) => {
  const { user, isManager, logout } = useAuth();
  const { warehouses, selectedWarehouseId, setSelectedWarehouseId } = useWarehouse();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Poll notifications count
  const checkNotifications = async () => {
    try {
      const res = await api.notifications.list();
      if (res.success) {
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger + Warehouse location filter */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Odoo style Location selector */}
        <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-500 hidden sm:inline">Location:</span>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer focus:ring-0"
          >
            <option value="all">🏢 All Warehouses (Aggregated)</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                📍 {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right actions: Fixed Role Badge, Notifications, User info */}
      <div className="flex items-center gap-3">
        {/* Secure Role Badge (Read-only, strictly from authenticated JWT) */}
        {isManager ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Role:</span>
            <span>Manager / Owner</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Role:</span>
            <span>Warehouse Staff</span>
          </div>
        )}

        {/* Notifications Icon with Drawer */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role === 'manager' ? 'Owner / Manager' : 'Warehouse Staff'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {user?.role}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
