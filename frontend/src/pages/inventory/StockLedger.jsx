import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ClipboardList,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RefreshCw,
  ShoppingCart,
  Calendar,
  Layers,
} from 'lucide-react';

export const StockLedger = () => {
  const { warehouses, selectedWarehouseId } = useWarehouse();
  const [ledger, setLedger] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.inventory.getLedger({
        warehouseId: selectedWarehouseId,
        transactionType: typeFilter,
        limit: 100,
      });
      if (res.success) {
        setLedger(res.ledger);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedWarehouseId, typeFilter]);

  const filteredLedger = ledger.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.product?.name?.toLowerCase().includes(term) ||
      l.product?.sku?.toLowerCase().includes(term) ||
      l.reference?.toLowerCase().includes(term) ||
      l.notes?.toLowerCase().includes(term)
    );
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'RECEIPT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TRANSFER_IN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TRANSFER_OUT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ADJUSTMENT_ADD':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ADJUSTMENT_SUB':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ORDER_FULFILLMENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Stock Ledger & Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete tamper-evident inventory transaction log tracking every single unit increment, decrement, and transfer.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          Logged Transactions: <span className="font-bold text-slate-800">{total}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, reference #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Transaction Types</option>
            <option value="RECEIPT">Receipts (Incoming)</option>
            <option value="DELIVERY">Deliveries (Outgoing)</option>
            <option value="ORDER_FULFILLMENT">Customer Order Fulfillment</option>
            <option value="TRANSFER_IN">Internal Transfer IN</option>
            <option value="TRANSFER_OUT">Internal Transfer OUT</option>
            <option value="ADJUSTMENT_ADD">Stock Adjustment (+)</option>
            <option value="ADJUSTMENT_SUB">Stock Adjustment (-)</option>
            <option value="INITIAL_STOCK">Initial System Allocation</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-center">Delta Qty</th>
                <th className="py-3 px-4 text-center">WH Balance</th>
                <th className="py-3 px-4 text-center">Company Total</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    Loading stock ledger entries...
                  </td>
                </tr>
              ) : filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    No ledger entries found matching criteria
                  </td>
                </tr>
              ) : (
                filteredLedger.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>{new Date(row.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(
                          row.transactionType
                        )}`}
                      >
                        {row.transactionType.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{row.product?.name || 'Item'}</p>
                      <span className="font-mono text-[10px] text-slate-400">{row.product?.sku}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {row.warehouse?.name || 'General Hub'}
                    </td>

                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={`text-sm ${
                          row.deltaQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {row.deltaQuantity > 0 ? `+${row.deltaQuantity}` : row.deltaQuantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {row.balanceAfter}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600 font-medium">
                      {row.totalSystemBalanceAfter}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                      <div>{row.reference || '—'}</div>
                      {row.notes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{row.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {row.performedBy?.name || 'Staff User'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
