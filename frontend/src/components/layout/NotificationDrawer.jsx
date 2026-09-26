import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Bell, CheckCheck, AlertTriangle, ShoppingCart, ArrowLeftRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.list();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.notifications.markRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-indigo-500" />;
      case 'operation':
        return <ArrowLeftRight className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-96 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden transition-all duration-200">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Notifications & Alerts</h3>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                !n.isRead ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
