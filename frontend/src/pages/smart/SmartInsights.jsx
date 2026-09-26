import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import {
  BrainCircuit,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ArrowDownLeft,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  TrendingDown,
} from 'lucide-react';

export const SmartInsights = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deadStockDays, setDeadStockDays] = useState(60);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.analytics.getSmartInsights({ deadStockDays });
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
    fetchInsights();
  }, [deadStockDays]);

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

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
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            StockSense AI & Smart Inventory Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Predictive restock advisor, dead-stock capital detector, and stockout date forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-medium">Dead Stock Inactivity Period:</span>
          <select
            value={deadStockDays}
            onChange={(e) => setDeadStockDays(Number(e.target.value))}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
            <option value={120}>120 Days</option>
          </select>
        </div>
      </div>

      {/* 1. SALES-BASED STOCKOUT PREDICTION / RUNOUT ALERT (Critical) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Sales-Based Stockout Risk Predictions
            </h2>
            <p className="text-xs text-slate-500">
              Calculates daily sales velocity (burn rate) to forecast exact days until inventory exhausts.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            {data?.stockoutPredictions?.length || 0} Products at Immediate Risk
          </span>
        </div>

        {data?.stockoutPredictions?.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
            🎉 All catalog products have sufficient runway for the upcoming 14 days!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.stockoutPredictions?.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                  item.riskLevel === 'IMMINENT'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        item.riskLevel === 'IMMINENT'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.riskLevel} RISK
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {item.currentStock} units left
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {item.product.sku}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Burn Rate:</span>
                      <span className="font-bold text-slate-900">{item.dailyBurnRate} units/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Predicted Stockout:</span>
                      <span className="font-bold text-rose-600">
                        {item.daysUntilStockout === 0 ? 'ALREADY OUT' : `In ~${item.daysUntilStockout} days`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/inventory/operations?action=receipt')}
                  className="mt-4 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Order Restock Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. SMART REORDER SUGGESTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Smart Reorder Recommendations
            </h2>
            <p className="text-[11px] text-slate-500">
              Formulated by factoring lead time, supplier turnaround, minimum thresholds, and current stock.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Reorder Threshold</th>
                <th className="py-3 px-4 text-center">Lead Time</th>
                <th className="py-3 px-4 text-center">Runout Forecast</th>
                <th className="py-3 px-4 text-center font-bold text-indigo-700">Recommended Order Qty</th>
                <th className="py-3 px-4 text-right">Est. Restock Cost</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.reorderSuggestions?.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400">
                    No restocks required at this moment. Inventory health is optimal!
                  </td>
                </tr>
              ) : (
                data?.reorderSuggestions?.map((re, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{re.product.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{re.product.sku}</span>
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-sm">
                      <span className={re.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'}>
                        {re.currentStock}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      {re.minStockLevel} {re.product.unit}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600">
                      {re.leadTimeDays} days
                    </td>

                    <td className="py-3 px-4 text-center font-semibold">
                      {re.daysUntilStockout === 0 ? (
                        <span className="text-rose-600">Depleted</span>
                      ) : (
                        <span className="text-slate-700">{re.daysUntilStockout} days</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-sm text-indigo-600 bg-indigo-50/30">
                      +{re.suggestedQuantity} {re.product.unit}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(re.estimatedCost)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          re.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : re.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {re.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => navigate('/inventory/operations?action=receipt')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] rounded-lg transition"
                      >
                        Draft Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DEAD-STOCK DETECTION & TIED CAPITAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              Dead-Stock Detection & Tied Capital Liquidation
            </h2>
            <p className="text-xs text-slate-500">
              Identifies furniture sitting unsold for more than {deadStockDays} days and calculates stagnant capital.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold">
            Total Capital Tied Up: {formatCurrency(data?.totalTiedDeadStockCapital)}
          </div>
        </div>

        {data?.deadStockItems?.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
            ✨ No dead stock found! All products are moving within {deadStockDays} days.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {data?.deadStockItems?.map((dead, idx) => (
              <div key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{dead.product.name}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {dead.product.sku}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unsold Units in Stock: <strong className="text-slate-800">{dead.currentStock}</strong> • Last Sale: {dead.daysSinceLastSale} days ago
                  </p>
                  <p className="text-xs text-indigo-700 font-medium mt-1">
                    💡 Suggested Strategy: {dead.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Tied Capital</span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {formatCurrency(dead.tiedCapital)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Potential Revenue</span>
                    <span className="font-extrabold text-sm text-emerald-600">
                      {formatCurrency(dead.potentialRevenue)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/inventory/operations?action=transfer')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Transfer to Floor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
