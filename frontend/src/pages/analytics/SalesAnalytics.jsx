import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Award,
  AlertCircle,
  BarChart2,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const SalesAnalytics = () => {
  const { isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getSales();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

  if (!isManager) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Sales Analytics and Financial Reports are reserved for the Inventory Manager / Owner role.
        </p>
        <p className="text-[11px] text-indigo-600 font-semibold">
          💡 Tip: Click the "Role: Staff" button in the top navigation bar to switch to Manager!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Furniture Sales Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze historical revenue trajectories, MoM growth rates, top volume furniture, and slow-moving inventory.
          </p>
        </div>
      </div>

      {/* KPI Cards: Current vs Prev Month */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Current Month Revenue</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(data?.currentMonthRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total closed & delivered customer orders</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Previous Month Revenue</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-700">
            {formatCurrency(data?.previousMonthRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Benchmark baseline</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Month-over-Month Growth</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold ${
                (data?.growthPercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(data?.growthPercent || 0) >= 0 ? '+' : ''}
              {data?.growthPercent}%
            </span>
            <span className="text-xs font-semibold text-slate-400">MoM %</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {(data?.growthPercent || 0) >= 0 ? 'Expanding sales volume' : 'Seasonal adjustment'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales History Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Sales Revenue History</h2>
              <p className="text-xs text-slate-500">12-Month sales trajectory</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Sales by Category</h2>
            <p className="text-xs text-slate-500 mb-4">Product category volume distribution</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="revenue"
                    nameKey="category"
                  >
                    {data?.categoryDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            {data?.categoryDistribution?.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  {c.category}
                </span>
                <span className="font-semibold text-slate-900">{formatCurrency(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best-Selling vs Slow-Moving Products Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best-Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Best-Selling Products
              </h3>
              <p className="text-xs text-slate-500">Highest gross revenue and customer volume</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.bestSelling?.slice(0, 5).map((prod, idx) => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{prod.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {prod.category} • SKU: {prod.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-indigo-600">{formatCurrency(prod.revenue)}</p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {prod.unitsSold} units sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Slow-Moving Products
              </h3>
              <p className="text-xs text-slate-500">Items with low turnover rate tying up warehouse capacity</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.slowMoving?.slice(0, 5).map((prod, idx) => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{prod.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Stock: {prod.currentStock} units • Price: {formatCurrency(prod.sellingPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {prod.unitsSold} sold
                  </span>
                  <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">
                    Low turnover
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
