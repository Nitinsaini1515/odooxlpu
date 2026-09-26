import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  User,
  MapPin,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const OrdersList = () => {
  const location = useLocation();
  const { isManager } = useAuth();
  const { warehouses, selectedWarehouseId } = useWarehouse();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New Order Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jalandhar',
  });
  const [fulfillmentWarehouseId, setFulfillmentWarehouseId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, sellingPrice: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check URL query param e.g. /orders?action=new
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      openCreateModal();
    }
  }, [location.search]);

  // Load products catalog
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.products.list();
        if (res.success) setProducts(res.products);
      } catch (e) {
        console.error(e);
      }
    };
    loadProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.list({
        status: statusFilter,
        warehouseId: selectedWarehouseId,
        search,
      });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, selectedWarehouseId, search]);

  const openCreateModal = () => {
    setFormError('');
    setCustomer({
      name: '',
      email: '',
      phone: '+91 ',
      address: '',
      city: 'Jalandhar',
    });
    setFulfillmentWarehouseId(warehouses[0]?._id || '');
    setNotes('');

    const firstProd = products[0];
    setOrderItems([
      {
        productId: firstProd?._id || '',
        quantity: 1,
        sellingPrice: firstProd?.sellingPrice || 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setOrderItems([
      ...orderItems,
      {
        productId: firstProd?._id || '',
        quantity: 1,
        sellingPrice: firstProd?.sellingPrice || 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const next = [...orderItems];
    next[idx][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        next[idx].sellingPrice = prod.sellingPrice;
      }
    }
    setOrderItems(next);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.orders.create({
        customer,
        fulfillmentWarehouseId,
        items: orderItems,
        notes,
      });
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      setFormError(err.message || 'Error creating order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-amber-600" /> Confirmed
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 flex items-center gap-1">
            <PackageCheck className="w-3 h-3 text-blue-600" /> Ready to Ship
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <Truck className="w-3 h-3 text-emerald-600" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Customer Purchase Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create customer orders, manage picking/packing pipeline, and execute automatic stock fulfillment.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ready">Ready (Picked & Packed)</option>
            <option value="delivered">Delivered (Fulfillment Complete)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Fulfillment Hub</th>
                <th className="py-3 px-4">Ordered Items</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    No customer orders found
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div>{ord.orderNumber}</div>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{ord.customer?.name}</p>
                      <p className="text-[11px] text-slate-500">{ord.customer?.phone}</p>
                      <p className="text-[10px] text-slate-400">{ord.customer?.city}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ord.fulfillmentWarehouse?.name || 'Main Hub'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {ord.items?.map((it, i) => (
                          <div key={i} className="text-slate-800">
                            <span className="font-bold">{it.quantity}x</span> {it.product?.name || 'Item'}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm">
                      {formatCurrency(ord.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(ord.totalProfit)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">{getStatusBadge(ord.status)}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {/* Pipeline Action Progression Buttons */}
                      <div className="flex items-center justify-center gap-1.5">
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'confirmed')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[10px] rounded-lg transition"
                            title="Confirm Customer Order"
                          >
                            Confirm Order
                          </button>
                        )}

                        {ord.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'ready')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] rounded-lg transition"
                            title="Warehouse Pick & Pack Completed"
                          >
                            Mark Ready (Pack)
                          </button>
                        )}

                        {ord.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'delivered')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded-lg transition shadow-xs"
                            title="Deliver order and automatically deduct stock"
                          >
                            Deliver & Deduct Stock
                          </button>
                        )}

                        {ord.status === 'delivered' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Fulfilled
                          </span>
                        )}

                        {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'cancelled')}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Cancel Order"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW CUSTOMER ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                Create Customer Purchase Order
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
              {/* Customer Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="e.g. Jasleen Bains"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="+91 98140..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="customer@email.com"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="Jalandhar"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="House / Commercial delivery address"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Fulfillment Warehouse */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fulfillment Dispatch Warehouse
                </label>
                <select
                  value={fulfillmentWarehouseId}
                  onChange={(e) => setFulfillmentWarehouseId(e.target.value)}
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

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ordered Furniture Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {orderItems.map((item, idx) => (
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

                      <div className="w-24">
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

                      <div className="w-28">
                        <label className="text-[10px] text-slate-500 font-medium block mb-0.5">Unit Price ₹</label>
                        <input
                          type="number"
                          min="0"
                          value={item.sellingPrice}
                          onChange={(e) => handleItemChange(idx, 'sellingPrice', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={orderItems.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 mt-4"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special customization or delivery time instructions..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                ></textarea>
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
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Placing Order...' : 'Confirm Order & Reserve Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
