import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Boxes,
  AlertTriangle,
  AlertOctagon,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  RefreshCw,
  Clock,
  ArrowLeftRight,
  ShoppingCart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Dashboard = () => {
  const { user, isManager } = useAuth();
  const { selectedWarehouse } = useWarehouse();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [recentOperations, setRecentOperations] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getDashboard();
      if (res.success) {
        setStats(res.stats);
        setMonthlyTrend(res.monthlyTrend || []);
        setRecentOperations(res.recentOperations || []);
        setRecentOrders(res.recentOrders || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading inventory metrics & analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedWarehouse ? `Location: ${selectedWarehouse.name}` : 'All Locations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time inventory levels, orders, and sales performance for StockSense Furniture.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/inventory/operations?action=receipt')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            New Receipt
          </button>

          <button
            onClick={() => navigate('/inventory/operations?action=delivery')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            New Delivery
          </button>

          <button
            onClick={() => navigate('/orders?action=new')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            New Customer Order
          </button>

          <button
            onClick={() => navigate('/inventory/operations?action=transfer')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Internal Transfer
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (8 Core requested Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total Stock */}
        <div
          onClick={() => navigate('/products')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Stock</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalStock || 0}</span>
            <span className="text-xs text-slate-400 font-medium">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {stats?.totalSkus || 0} active furniture SKUs</p>
        </div>

        {/* 2. Low Stock */}
        <div
          onClick={() => navigate('/products?status=low')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Stock</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{stats?.lowStock || 0}</span>
            <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              Needs restock
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Below minimum threshold</p>
        </div>

        {/* 3. Out of Stock */}
        <div
          onClick={() => navigate('/products?status=out')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-rose-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Out of Stock</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600">{stats?.outOfStock || 0}</span>
            <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">0 available inventory</p>
        </div>

        {/* 4. Pending Receipts */}
        <div
          onClick={() => navigate('/inventory/operations?type=receipt')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Receipts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.pendingReceipts || 0}</span>
            <span className="text-xs text-slate-400 font-medium">shipments</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Incoming supplier orders</p>
        </div>

        {/* 5. Pending Deliveries */}
        <div
          onClick={() => navigate('/orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Deliveries</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats?.pendingDeliveries || 0}</span>
            <span className="text-xs text-slate-400 font-medium">orders</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending pick & delivery</p>
        </div>

        {/* 6. Monthly Sales */}
        <div
          onClick={() => isManager && navigate('/analytics/sales')}
          className={`bg-white p-4 rounded-xl border border-slate-200 transition shadow-xs group ${
            isManager ? 'hover:border-indigo-400 cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Sales</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(stats?.currentMonthSales)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Prev month: {formatCurrency(stats?.prevMonthSales)}
          </p>
        </div>

        {/* 7. Monthly Profit */}
        <div
          onClick={() => isManager && navigate('/analytics/profit')}
          className={`bg-white p-4 rounded-xl border border-slate-200 transition shadow-xs group ${
            isManager ? 'hover:border-emerald-400 cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Profit</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(stats?.currentMonthProfit)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Net profit after unit COGS</p>
        </div>

        {/* 8. Monthly Growth % */}
        <div
          onClick={() => isManager && navigate('/analytics/sales')}
          className={`bg-white p-4 rounded-xl border border-slate-200 transition shadow-xs group ${
            isManager ? 'hover:border-indigo-400 cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Growth</span>
            <div
              className={`p-2 rounded-lg transition ${
                (stats?.monthlyGrowthPercent || 0) >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {(stats?.monthlyGrowthPercent || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-extrabold ${
                (stats?.monthlyGrowthPercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(stats?.monthlyGrowthPercent || 0) >= 0 ? '+' : ''}
              {stats?.monthlyGrowthPercent || 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">MoM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Revenue vs previous month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trend (2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue & Net Profit Trend</h2>
              <p className="text-xs text-slate-500">Performance over the past 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Profit
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Quick Alerts & Reorder Box */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Smart Inventory
              </span>
              <span className="text-xs text-indigo-300">Predictive</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Restock Advisor</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed mb-4">
              StockSense scans recent sales velocity, supplier lead times, and current stock in Jalandhar to anticipate stockouts before they hit zero.
            </p>

            <div className="space-y-2.5">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Chesterfield 3-Seater Sofa</p>
                  <p className="text-[11px] text-amber-300">Runout in ~7 days (6 units left)</p>
                </div>
                <button
                  onClick={() => navigate('/inventory/operations?action=receipt')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white text-indigo-950 rounded-lg hover:bg-indigo-50 transition"
                >
                  Reorder
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Riviera Patio Sofa Set</p>
                  <p className="text-[11px] text-rose-300">Stockout! Lead time: 15 days</p>
                </div>
                <button
                  onClick={() => navigate('/inventory/operations?action=receipt')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white text-indigo-950 rounded-lg hover:bg-indigo-50 transition"
                >
                  Restock
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => navigate('/smart-insights')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>View All Smart Recommendations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities: Operations & Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inventory Operations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Inventory Operations</h2>
              <p className="text-xs text-slate-500">Receipts, deliveries, transfers & adjustments</p>
            </div>
            <button
              onClick={() => navigate('/inventory/operations')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOperations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No operations recorded yet</p>
            ) : (
              recentOperations.map((op) => (
                <div key={op._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg text-xs font-bold ${
                        op.type === 'receipt'
                          ? 'bg-emerald-50 text-emerald-700'
                          : op.type === 'delivery'
                          ? 'bg-blue-50 text-blue-700'
                          : op.type === 'transfer'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {op.type === 'receipt' && <ArrowDownLeft className="w-4 h-4" />}
                      {op.type === 'delivery' && <ArrowUpRight className="w-4 h-4" />}
                      {op.type === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                      {op.type === 'adjustment' && <RefreshCw className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{op.operationNumber}</p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {op.type} • {op.items?.length || 0} item(s) •{' '}
                        {op.destinationWarehouse?.name || op.sourceWarehouse?.name || 'Central'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {op.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(op.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Live order fulfillment progress</p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No customer orders placed yet</p>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{ord.orderNumber}</p>
                      <p className="text-[11px] text-slate-500">
                        {ord.customer?.name} • {ord.customer?.city || 'Jalandhar'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(ord.totalAmount)}</p>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'confirmed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
