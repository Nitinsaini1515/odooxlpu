// Centralized API client for StockSense
const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('stocksense_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: (credentials) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),

    demoLogin: (role) =>
      fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).then(handleResponse),

    forgotPassword: (email) =>
      fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(handleResponse),

    verifyOtpReset: (payload) =>
      fetch(`${API_BASE}/auth/verify-otp-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Products
  products: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/products?${query}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },

    get: (id) =>
      fetch(`${API_BASE}/products/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    create: (data) =>
      fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getSalesHistory: (id) =>
      fetch(`${API_BASE}/products/${id}/sales-history`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },

  // Warehouses
  warehouses: {
    list: () =>
      fetch(`${API_BASE}/warehouses`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    get: (id) =>
      fetch(`${API_BASE}/warehouses/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getMatrix: () =>
      fetch(`${API_BASE}/warehouses/matrix/overview`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    create: (data) =>
      fetch(`${API_BASE}/warehouses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${API_BASE}/warehouses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),
  },

  // Inventory Operations & Ledger
  inventory: {
    getOperations: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/inventory/operations?${query}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },

    getOperationDetail: (id) =>
      fetch(`${API_BASE}/inventory/operations/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    createReceipt: (data) =>
      fetch(`${API_BASE}/inventory/receipts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    createDelivery: (data) =>
      fetch(`${API_BASE}/inventory/deliveries`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    createTransfer: (data) =>
      fetch(`${API_BASE}/inventory/transfers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    createAdjustment: (data) =>
      fetch(`${API_BASE}/inventory/adjustments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    getLedger: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/inventory/ledger?${query}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },
  },

  // Orders
  orders: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/orders?${query}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },

    get: (id) =>
      fetch(`${API_BASE}/orders/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    create: (data) =>
      fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    updateStatus: (id, status) =>
      fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }).then(handleResponse),
  },

  // Analytics
  analytics: {
    getDashboard: () =>
      fetch(`${API_BASE}/analytics/dashboard`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getStaffDashboard: () =>
      fetch(`${API_BASE}/analytics/staff-dashboard`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getSales: () =>
      fetch(`${API_BASE}/analytics/sales`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getProfit: () =>
      fetch(`${API_BASE}/analytics/profit`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    getSmartInsights: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/analytics/smart-insights?${query}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse);
    },
  },

  // Notifications
  notifications: {
    list: () =>
      fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
      }).then(handleResponse),

    markAllRead: () =>
      fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }).then(handleResponse),

    markRead: (id) =>
      fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      }).then(handleResponse),
  },
};
