import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  RefreshCw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const Operations = () => {
  const location = useLocation();
  const { warehouses, selectedWarehouseId } = useWarehouse();

  // Active tab: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
  const [activeTab, setActiveTab] = useState('receipt');
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Create Operation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('receipt'); // receipt | delivery | transfer | adjustment

  // Detail Modal
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('Annual Physical Cycle Count');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitCost: 0, countedQuantity: 0, systemQuantity: 0 },
  ]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check URL query param for quick action e.g. /inventory/operations?action=receipt
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const type = params.get('type');
    if (action && ['receipt', 'delivery', 'transfer', 'adjustment'].includes(action)) {
      setActiveTab(action);
      openCreateModal(action);
    } else if (type && ['receipt', 'delivery', 'transfer', 'adjustment'].includes(type)) {
      setActiveTab(type);
    }
  }, [location.search]);

  // Load products list for item dropdown
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await api.products.list();
        if (res.success) {
          setProducts(res.products);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCatalog();
  }, []);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const res = await api.inventory.getOperations({
        type: activeTab,
        warehouseId: selectedWarehouseId,
      });
      if (res.success) {
        setOperations(res.operations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [activeTab, selectedWarehouseId]);

  const openCreateModal = (type = activeTab) => {
    setModalType(type);
    setFormError('');
    setPartnerName('');
    setReference('');
    setNotes('');
    setReason('Annual Physical Cycle Count');

    const defaultWh = warehouses[0]?._id || '';
    const secondWh = warehouses[1]?._id || warehouses[0]?._id || '';

    setSourceWarehouseId(defaultWh);
    setDestinationWarehouseId(type === 'transfer' ? secondWh : defaultWh);

    const firstProd = products[0];
    setItems([
      {
        productId: firstProd?._id || '',
        quantity: 1,
        unitCost: firstProd?.purchasePrice || 0,
        countedQuantity: firstProd?.totalStock || 0,
        systemQuantity: firstProd?.totalStock || 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setItems([
      ...items,
      {
        productId: firstProd?._id || '',
        quantity: 1,
        unitCost: firstProd?.purchasePrice || 0,
        countedQuantity: firstProd?.totalStock || 0,
        systemQuantity: firstProd?.totalStock || 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        next[idx].unitCost = prod.purchasePrice;
        next[idx].systemQuantity = prod.totalStock;
        next[idx].countedQuantity = prod.totalStock;
      }
    }
    setItems(next);
  };

  const handleSubmitOperation = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (modalType === 'receipt') {
        await api.inventory.createReceipt({
          destinationWarehouseId,
          supplierName: partnerName,
          reference,
          notes,
          items,
        });
      } else if (modalType === 'delivery') {
        await api.inventory.createDelivery({
          sourceWarehouseId,
          customerName: partnerName,
          reference,
          notes,
          items,
        });
      } else if (modalType === 'transfer') {
        if (sourceWarehouseId === destinationWarehouseId) {
          throw new Error('Source and Destination warehouses must be different for internal transfer');
        }
        await api.inventory.createTransfer({
          sourceWarehouseId,
          destinationWarehouseId,
          notes,
          items,
        });
      } else if (modalType === 'adjustment') {
        await api.inventory.createAdjustment({
          warehouseId: sourceWarehouseId,
          reason,
          notes,
          items,
        });
      }

      setIsModalOpen(false);
      fetchOperations();
    } catch (err) {
      setFormError(err.message || 'Error executing operation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (op) => {
    setSelectedOperation(op);
    setIsDetailOpen(true);
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            Inventory Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute incoming supplier receipts, customer deliveries, internal transfers, and physical cycle count adjustments.
          </p>
        </div>

        <button
          onClick={() => openCreateModal(activeTab)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            New{' '}
            {activeTab === 'receipt'
              ? 'Receipt'
              : activeTab === 'delivery'
              ? 'Delivery'
              : activeTab === 'transfer'
              ? 'Transfer'
              : 'Adjustment'}
          </span>
        </button>
      </div>

      {/* Operation Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('receipt')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'receipt'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Receipts (Incoming)
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'delivery'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Deliveries (Outgoing)
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'transfer'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Internal Transfers
        </button>

        <button
          onClick={() => setActiveTab('adjustment')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'adjustment'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Stock Adjustments
        </button>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-b-2xl rounded-t-none border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Operation #</th>
                <th className="py-3 px-4">Partner / Reason</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-center">Items Count</th>
                <th className="py-3 px-4">Executed By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    Loading operations...
                  </td>
                </tr>
              ) : operations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    No {activeTab} operations recorded in this warehouse view
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {op.operationNumber}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {op.partnerName || op.reason || 'General Movement'}
                      </span>
                      {op.reference && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Ref: {op.reference}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {op.sourceWarehouse ? `${op.sourceWarehouse.name} (${op.sourceWarehouse.code})` : '— (Supplier)'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {op.destinationWarehouse
                        ? `${op.destinationWarehouse.name} (${op.destinationWarehouse.code})`
                        : '— (Customer)'}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {op.items?.length || 0} line(s)
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {op.performedBy?.name || 'Staff User'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(op.createdAt).toLocaleDateString()} •{' '}
                      {new Date(op.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {op.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewDetail(op)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE OPERATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-lg ${
                    modalType === 'receipt'
                      ? 'bg-emerald-50 text-emerald-700'
                      : modalType === 'delivery'
                      ? 'bg-blue-50 text-blue-700'
                      : modalType === 'transfer'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {modalType === 'receipt' && <ArrowDownLeft className="w-4 h-4" />}
                  {modalType === 'delivery' && <ArrowUpRight className="w-4 h-4" />}
                  {modalType === 'transfer' && <ArrowLeftRight className="w-4 h-4" />}
                  {modalType === 'adjustment' && <RefreshCw className="w-4 h-4" />}
                </span>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  Record New {modalType}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOperation} className="mt-4 space-y-4">
              {/* Warehouse Selection depending on type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalType !== 'receipt' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {modalType === 'adjustment' ? 'Audit Warehouse' : 'Source Warehouse'}
                    </label>
                    <select
                      value={sourceWarehouseId}
                      onChange={(e) => setSourceWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalType !== 'delivery' && modalType !== 'adjustment' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Destination Warehouse
                    </label>
                    <select
                      value={destinationWarehouseId}
                      onChange={(e) => setDestinationWarehouseId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      required
                    >
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Partner info or reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalType === 'receipt' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name</label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Punjab Timber & Woodcraft Ltd"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                )}

                {modalType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g. Simranjit Kaur"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                )}

                {modalType === 'adjustment' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Annual Physical Cycle Count">Annual Physical Cycle Count</option>
                      <option value="Damaged in Warehouse Storage">Damaged in Warehouse Storage</option>
                      <option value="Found Unrecorded Stock">Found Unrecorded Stock</option>
                      <option value="Transit Breakage">Transit Breakage</option>
                      <option value="Customer Return Reconciliation">Customer Return Reconciliation</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Note #</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. PO-98124 or Memo ref"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Items List Dynamic Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Operation Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          required
                        >
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.sku}) — Available: {p.totalStock}
                            </option>
                          ))}
                        </select>
                      </div>

                      {modalType === 'adjustment' ? (
                        <>
                          <div className="w-24">
                            <label className="text-[10px] text-slate-500 font-medium block mb-0.5">System Qty</label>
                            <input
                              type="number"
                              disabled
                              value={item.systemQuantity}
                              className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-slate-100 text-slate-500"
                            />
                          </div>

                          <div className="w-24">
                            <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Counted Qty</label>
                            <input
                              type="number"
                              min="0"
                              value={item.countedQuantity}
                              onChange={(e) => handleItemChange(idx, 'countedQuantity', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 font-bold"
                              required
                            />
                          </div>

                          <div className="w-20 text-center">
                            <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Delta</label>
                            <span
                              className={`text-xs font-bold ${
                                item.countedQuantity - item.systemQuantity > 0
                                  ? 'text-emerald-600'
                                  : item.countedQuantity - item.systemQuantity < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.countedQuantity - item.systemQuantity > 0 ? '+' : ''}
                              {item.countedQuantity - item.systemQuantity}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-28">
                          <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 font-bold"
                            required
                          />
                        </div>
                      )}

                      {modalType === 'receipt' && (
                        <div className="w-28">
                          <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Unit Cost ₹</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-300"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 mt-4"
                        title="Remove row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Memo / Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional delivery instructions, vehicle number, or condition notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {submitting ? 'Executing Operation...' : 'Post & Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPERATION DETAIL MODAL */}
      {isDetailOpen && selectedOperation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {selectedOperation.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedOperation.operationNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Location:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedOperation.destinationWarehouse?.name ||
                      selectedOperation.sourceWarehouse?.name ||
                      'Main Hub'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <span className="font-bold text-emerald-600 uppercase">
                    {selectedOperation.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Partner / Reason:</span>
                  <span className="font-medium text-slate-800">
                    {selectedOperation.partnerName || selectedOperation.reason || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Executed By:</span>
                  <span className="font-medium text-slate-800">
                    {selectedOperation.performedBy?.name || 'Staff User'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">Transacted Products:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedOperation.items?.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.product?.name || 'Product'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {item.product?.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">{item.quantity} units</span>
                        {item.unitPrice > 0 && (
                          <span className="text-[10px] text-slate-500 block">
                            @ {formatCurrency(item.unitPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOperation.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-600 italic border border-slate-100">
                  Note: {selectedOperation.notes}
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
