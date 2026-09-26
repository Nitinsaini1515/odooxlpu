import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RefreshCw,
  PackageCheck,
  Clock,
  CheckCircle,
  Truck,
  ShoppingCart,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const { selectedWarehouse } = useWarehouse();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [ordersToPack, setOrdersToPack] = useState([]);
  const [recentOperations, setRecentOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getStaffDashboard();
      if (res.success) {
        setStats(res.stats);
        setOrdersToPack(res.ordersToPack || []);
        setRecentOperations(res.recentOperations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.orders.updateStatus(orderId, status);
      fetchStaffData();
    } catch (err) {
      alert(err.message || 'Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Warehouse Operations Floor 👋
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Staff Portal • {selectedWarehouse ? selectedWarehouse.name : 'All Floor Locations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong>. Manage incoming supplier goods, pick/pack orders, and inventory audits.
          </p>
        </div>

        {/* Staff Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/inventory/operations?action=receipt')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Receive Stock
          </button>

          <button
            onClick={() => navigate('/orders?status=confirmed')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Pick & Pack
          </button>

          <button
            onClick={() => navigate('/inventory/operations?action=transfer')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Internal Transfer
          </button>

          <button
            onClick={() => navigate('/inventory/operations?action=adjustment')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Cycle Count
          </button>
        </div>
      </div>

      {/* Staff Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pending Receipts */}
        <div
          onClick={() => navigate('/inventory/operations?type=receipt')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Receipts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.pendingReceipts || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Inward supplier shipments</p>
        </div>

        {/* Orders to Pick & Pack */}
        <div
          onClick={() => navigate('/orders?status=confirmed')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Awaiting Pick & Pack</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">
            {stats?.confirmedOrdersToPack || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Orders ready for warehouse packing</p>
        </div>

        {/* Ready for Dispatch */}
        <div
          onClick={() => navigate('/orders?status=ready')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ready for Dispatch</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {stats?.readyOrdersToDispatch || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Packed, awaiting delivery</p>
        </div>

        {/* Total Physical Stock Units */}
        <div
          onClick={() => navigate('/products')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 transition cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Physical Units</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalStockUnits || 0}</span>
            <span className="text-xs text-slate-400">items</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {stats?.totalSkus || 0} catalog SKUs</p>
        </div>
      </div>

      {/* Main Floor Task Areas: Pick & Pack Queue + Recent Floor Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Pick & Pack Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                  Floor Pick & Pack Queue
                </h2>
                <p className="text-xs text-slate-500">Customer orders waiting for staff packing & dispatch</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                All Orders
              </button>
            </div>

            {ordersToPack.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                ✨ No orders awaiting packing right now. Floor queue is clear!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ordersToPack.map((ord) => (
                  <div key={ord._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ord.status === 'confirmed'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ord.status === 'confirmed' ? 'Needs Packing' : 'Packed (Ready)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 font-medium">
                        Customer: {ord.customer?.name} • Destination: {ord.customer?.city || 'Jalandhar'}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-0.5 space-x-1">
                        {ord.items?.map((it, idx) => (
                          <span key={idx} className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            <strong>{it.quantity}x</strong> {it.product?.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ord.status === 'confirmed' ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'ready')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Mark Packed</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'delivered')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch & Deduct</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Floor Operations (Receipts, Transfers, Cycle Counts) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  Recent Warehouse Movements
                </h2>
                <p className="text-xs text-slate-500">Inward receipts, internal transfers & physical audits</p>
              </div>
              <button
                onClick={() => navigate('/inventory/operations')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Operations Hub
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentOperations.slice(0, 6).map((op) => (
                <div key={op._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg font-bold ${
                        op.type === 'receipt'
                          ? 'bg-emerald-50 text-emerald-700'
                          : op.type === 'transfer'
                          ? 'bg-purple-50 text-purple-700'
                          : op.type === 'delivery'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {op.type === 'receipt' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {op.type === 'transfer' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                      {op.type === 'delivery' && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {op.type === 'adjustment' && <RefreshCw className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{op.operationNumber}</p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {op.type} • {op.items?.length || 0} product lines • {op.partnerName || op.reason || 'Movement'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {op.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(op.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/inventory/ledger')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View Full Immutable Audit Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
