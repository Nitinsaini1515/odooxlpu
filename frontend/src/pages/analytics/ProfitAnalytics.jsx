import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  CircleDollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight,
  ShieldAlert,
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
  Legend,
} from 'recharts';

export const ProfitAnalytics = () => {
  const { isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfitData = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getProfit();
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
    fetchProfitData();
  }, []);

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  if (!isManager) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Manager Restricted</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
          Cost of Goods Sold (COGS) and Net Profit Margins are restricted to Inventory Managers & Company Owners.
        </p>
        <p className="text-[11px] text-indigo-600 font-semibold">
          💡 Switch your role in the top header to view this report.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-emerald-600" />
            Profit Margin & Cost of Goods Sold (COGS) Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculated unit-by-unit: Net Profit = Customer Selling Price - Wholesale Purchase Price.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Cumulative Gross Sales</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {formatCurrency(data?.summary?.totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total revenue collected</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Cost of Goods Sold (COGS)</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-600">
            {formatCurrency(data?.summary?.totalCOGS)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Inventory purchase expense</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Net Profit</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(data?.summary?.totalProfit)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Gross Margin after unit cost</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Average Profit Margin</span>
          <div className="mt-2 text-2xl font-extrabold text-indigo-600">
            {data?.summary?.overallMargin || 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all furniture categories</p>
        </div>
      </div>

      {/* Monthly Profit Comparison Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Monthly Profit vs COGS Breakdown</h2>
            <p className="text-xs text-slate-500">Gross Revenue vs Direct Cost vs Net Profit</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyProfitComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="Total Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cogs" name="COGS (Cost)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product-Wise Profit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Product-Wise Profit Contribution
          </h3>
          <span className="text-[11px] text-slate-500">Ranked by total profit generated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Total Cost (COGS)</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-center">Profit Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.productProfits?.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{prod.name}</p>
                    <span className="font-mono text-[10px] text-slate-400">{prod.sku}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{prod.category}</td>

                  <td className="py-3 px-4 text-center font-bold text-slate-900">{prod.unitsSold}</td>

                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {formatCurrency(prod.revenue)}
                  </td>

                  <td className="py-3 px-4 text-right text-slate-500">
                    {formatCurrency(prod.cogs)}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    {formatCurrency(prod.profit)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        prod.marginPercent >= 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.marginPercent >= 35
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prod.marginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
