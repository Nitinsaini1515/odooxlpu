import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Armchair,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  History,
  AlertTriangle,
  Boxes,
  Building2,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const ProductsList = () => {
  const { isManager } = useAuth();
  const { warehouses, selectedWarehouseId } = useWarehouse();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [salesHistoryData, setSalesHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Living Room',
    unit: 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    minStockLevel: 10,
    maxStockLevel: 50,
    leadTimeDays: 7,
    initialStock: 20,
    initialWarehouseId: '',
    material: '',
    dimensions: '',
    description: '',
  });

  const categories = ['All', 'Living Room', 'Dining Room', 'Bedroom', 'Office', 'Storage', 'Outdoor'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.list({
        search,
        category: selectedCategory,
        stockStatus: stockStatusFilter,
        warehouseId: selectedWarehouseId,
      });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, stockStatusFilter, selectedWarehouseId]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `FURN-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Living Room',
      unit: 'pcs',
      purchasePrice: '',
      sellingPrice: '',
      minStockLevel: 10,
      maxStockLevel: 50,
      leadTimeDays: 7,
      initialStock: 15,
      initialWarehouseId: warehouses[0]?._id || '',
      material: 'Solid Wood & Premium Upholstery',
      dimensions: 'Standard Dimensions',
      description: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unit: prod.unit,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      minStockLevel: prod.minStockLevel,
      maxStockLevel: prod.maxStockLevel,
      leadTimeDays: prod.leadTimeDays || 7,
      material: prod.material || '',
      dimensions: prod.dimensions || '',
      description: prod.description || '',
    });
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.products.update(editingProduct._id, formData);
      } else {
        await api.products.create(formData);
      }
      setIsAddEditOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive product '${name}'?`)) return;
    try {
      await api.products.delete(id);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleViewSalesHistory = async (prod) => {
    setIsSalesHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.products.getSalesHistory(prod._id);
      if (res.success) {
        setSalesHistoryData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Armchair className="w-5 h-5 text-indigo-600" />
            Furniture Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product specs, pricing, SKUs, reorder thresholds, and warehouse stock.
          </p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in">In Stock Only</option>
            <option value="low">Low Stock (Alert)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table (Odoo style) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                {isManager && <th className="py-3 px-4 text-right">Cost Price</th>}
                <th className="py-3 px-4 text-right">Selling Price</th>
                {isManager && <th className="py-3 px-4 text-right">Profit / Unit</th>}
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Reorder Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={isManager ? 9 : 7} className="text-center py-12 text-slate-400">
                    Loading products catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 9 : 7} className="text-center py-12 text-slate-400">
                    No products matched your criteria
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const profit = prod.sellingPrice - prod.purchasePrice;
                  const margin = Math.round((profit / prod.sellingPrice) * 100);

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{prod.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>SKU: {prod.sku}</span>
                          <span>•</span>
                          <span>{prod.unit}</span>
                          <span>•</span>
                          <span className="text-slate-400">{prod.dimensions}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          {prod.category}
                        </span>
                      </td>

                      {isManager && (
                        <td className="py-3 px-4 text-right text-slate-600 font-medium">
                          {formatCurrency(prod.purchasePrice)}
                        </td>
                      )}

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(prod.sellingPrice)}
                      </td>

                      {isManager && (
                        <td className="py-3 px-4 text-right">
                          <div className="font-semibold text-emerald-600">{formatCurrency(profit)}</div>
                          <div className="text-[10px] text-slate-400">{margin}% margin</div>
                        </td>
                      )}

                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900">{prod.totalStock}</span>
                        {prod.reservedStock > 0 && (
                          <span className="text-[10px] text-amber-600 block">
                            ({prod.reservedStock} reserved)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-500 font-medium">
                        {prod.minStockLevel} {prod.unit}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {prod.status === 'OUT_OF_STOCK' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : prod.status === 'LOW_STOCK' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewSalesHistory(prod)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Product Sales History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {isManager && (
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isManager && (
                            <button
                              onClick={() => handleDeleteProduct(prod._id, prod.name)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Archive Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Furniture Product' : 'Add New Furniture Item'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Teak 6-Seater Dining Table"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. FURN-DIN-101"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="set">Complete Set (set)</option>
                    <option value="pair">Pair (pair)</option>
                    <option value="box">Box (box)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Restock Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Price (Cost) ₹</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (MSRP) ₹</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="e.g. 27500"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum / Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStockLevel}
                    onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {!editingProduct && (
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">Assign to Warehouse</label>
                    <select
                      value={formData.initialWarehouseId}
                      onChange={(e) => setFormData({ ...formData, initialWarehouseId: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material / Finish</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Sheesham Wood with Walnut Finish"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 72L x 36W x 30H inches"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Spec Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, wood seasoning details, assembly notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product-wise Sales History & Ledger Drawer / Modal */}
      {isSalesHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Product Sales & Ledger History: {salesHistoryData?.product?.name}
                </h3>
                <p className="text-xs text-slate-500">SKU: {salesHistoryData?.product?.sku}</p>
              </div>
              <button
                onClick={() => setIsSalesHistoryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">Loading sales history...</div>
            ) : (
              <div className="mt-4 space-y-6">
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Units Sold</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {salesHistoryData?.stats?.totalUnitsSold || 0} units
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Revenue</span>
                    <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
                      {formatCurrency(salesHistoryData?.stats?.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Total Net Profit</span>
                    <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                      {formatCurrency(salesHistoryData?.stats?.totalProfit)}
                    </p>
                  </div>
                </div>

                {/* Orders Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Customer Sales Orders Containing this Item
                  </h4>
                  {salesHistoryData?.sales?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No orders placed for this item yet.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                          <tr>
                            <th className="py-2.5 px-3">Order #</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                            <th className="py-2.5 px-3 text-right">Profit</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {salesHistoryData?.sales?.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{s.orderNumber}</td>
                              <td className="py-2.5 px-3 text-slate-600">{s.customerName}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-900">{s.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                                {formatCurrency(s.subtotal)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                                {formatCurrency(s.profit)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recent Ledger Entries for this Product */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Recent Stock Movements for this Item
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3 text-center">Delta</th>
                          <th className="py-2.5 px-3 text-center">Balance After</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {salesHistoryData?.ledger?.slice(0, 8).map((led, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  led.deltaQuantity > 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {led.transactionType}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{led.warehouse?.name}</td>
                            <td className="py-2 px-3 text-center font-bold">
                              <span className={led.deltaQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {led.deltaQuantity > 0 ? `+${led.deltaQuantity}` : led.deltaQuantity}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-900">{led.balanceAfter}</td>
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {new Date(led.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
