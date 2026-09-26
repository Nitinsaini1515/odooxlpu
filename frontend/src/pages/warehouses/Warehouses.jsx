import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Boxes,
  Layers,
  ArrowLeftRight,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Warehouses = () => {
  const { isManager } = useAuth();
  const { reloadWarehouses } = useWarehouse();
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [matrixData, setMatrixData] = useState({ warehouses: [], matrix: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'matrix'

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Jalandhar',
    capacity: 5000,
    managerContact: '',
    isDefault: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [whRes, matrixRes] = await Promise.all([
        api.warehouses.list(),
        api.warehouses.getMatrix(),
      ]);
      if (whRes.success) setWarehouses(whRes.warehouses);
      if (matrixRes.success) setMatrixData(matrixRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingWh(null);
    setFormData({
      name: '',
      code: `WH-PUN-${Math.floor(10 + Math.random() * 90)}`,
      address: '',
      city: 'Jalandhar',
      capacity: 5000,
      managerContact: '+91 98140 ',
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wh) => {
    setEditingWh(wh);
    setFormData({
      name: wh.name,
      code: wh.code,
      address: wh.address,
      city: wh.city,
      capacity: wh.capacity,
      managerContact: wh.managerContact,
      isDefault: wh.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    try {
      if (editingWh) {
        await api.warehouses.update(editingWh._id, formData);
      } else {
        await api.warehouses.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
      reloadWarehouses();
    } catch (err) {
      alert(err.message || 'Error saving warehouse');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Warehouses & Multi-Location Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time storage capacities, physical distribution hubs, and cross-warehouse stock matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Location Cards vs Cross-Location Stock Matrix */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-3 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'locations'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Warehouse Locations Overview
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'matrix'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Cross-Warehouse Stock Matrix
        </button>
      </div>

      {activeTab === 'locations' ? (
        /* Warehouse Location Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {wh.code}
                  </span>
                  {wh.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Default Hub
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{wh.address}, {wh.city}</span>
                  </p>
                  {wh.managerContact && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{wh.managerContact}</span>
                    </p>
                  )}
                </div>

                {/* Capacity & Stock Stats */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Inventory Stored:</span>
                    <span className="font-extrabold text-slate-900">{wh.totalUnits || 0} units</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Active SKUs:</span>
                    <span className="font-semibold text-slate-700">{wh.distinctSkus || 0} items</span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Capacity Utilization:</span>
                      <span className="font-bold text-slate-800">{wh.utilization || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (wh.utilization || 0) > 85
                            ? 'bg-rose-500'
                            : (wh.utilization || 0) > 60
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, wh.utilization || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate('/inventory/operations?action=transfer')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Initiate Transfer
                </button>

                {isManager && (
                  <button
                    onClick={() => handleOpenEdit(wh)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Edit Info
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cross-Warehouse Stock Matrix (Product vs Locations) */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Product Quantity Breakdown by Warehouse Location
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  {matrixData.warehouses?.map((wh) => (
                    <th key={wh._id} className="py-3 px-4 text-center">
                      <div>{wh.name}</div>
                      <span className="font-mono text-[10px] text-indigo-600">{wh.code}</span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center bg-slate-100/80 font-extrabold text-slate-900">
                    Total Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.matrix?.map((row) => (
                  <tr key={row.product._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{row.product.name}</p>
                      <span className="font-mono text-[10px] text-slate-400">{row.product.sku}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{row.product.category}</td>

                    {matrixData.warehouses?.map((wh) => {
                      const stockAtWh = row.warehouseStock[wh._id]?.quantity || 0;
                      return (
                        <td key={wh._id} className="py-3 px-4 text-center font-bold">
                          <span
                            className={
                              stockAtWh === 0
                                ? 'text-slate-300'
                                : stockAtWh <= 5
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }
                          >
                            {stockAtWh}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-center font-extrabold text-indigo-700 bg-slate-50/50">
                      {row.totalStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Warehouse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingWh ? 'Edit Warehouse Location' : 'Add New Warehouse'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Model Town Furniture Depot"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WH-JAL-03"
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Jalandhar"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Industrial Plot address"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Units)</label>
                  <input
                    type="number"
                    min="100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.managerContact}
                    onChange={(e) => setFormData({ ...formData, managerContact: e.target.value })}
                    placeholder="+91 98140..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Set as primary default fulfillment warehouse</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {editingWh ? 'Save Updates' : 'Add Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
