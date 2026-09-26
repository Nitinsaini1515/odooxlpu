import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WarehouseProvider } from './context/WarehouseContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProductsList } from './pages/products/ProductsList';
import { Operations } from './pages/inventory/Operations';
import { StockLedger } from './pages/inventory/StockLedger';
import { Warehouses } from './pages/warehouses/Warehouses';
import { OrdersList } from './pages/orders/OrdersList';
import { SalesAnalytics } from './pages/analytics/SalesAnalytics';
import { ProfitAnalytics } from './pages/analytics/ProfitAnalytics';
import { SmartInsights } from './pages/smart/SmartInsights';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <WarehouseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes inside AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="inventory/operations" element={<Operations />} />
              <Route path="inventory/ledger" element={<StockLedger />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="orders" element={<OrdersList />} />
              <Route path="analytics/sales" element={<SalesAnalytics />} />
              <Route path="analytics/profit" element={<ProfitAnalytics />} />
              <Route path="smart-insights" element={<SmartInsights />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </WarehouseProvider>
    </AuthProvider>
  );
};

export default App;
