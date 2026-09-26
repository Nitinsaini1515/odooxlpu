import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WarehouseProvider } from './context/WarehouseContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Landing & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Role Dashboards & Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { StaffDashboard } from './pages/dashboard/StaffDashboard';
import { ProductsList } from './pages/products/ProductsList';
import { Operations } from './pages/inventory/Operations';
import { StockLedger } from './pages/inventory/StockLedger';
import { Warehouses } from './pages/warehouses/Warehouses';
import { OrdersList } from './pages/orders/OrdersList';
import { SalesAnalytics } from './pages/analytics/SalesAnalytics';
import { ProfitAnalytics } from './pages/analytics/ProfitAnalytics';
import { SmartInsights } from './pages/smart/SmartInsights';

// Generic Authentication Guard
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

// Executive Manager Only Route Guard
const ManagerRoute = ({ children }) => {
  const { isAuthenticated, isManager, loading } = useAuth();

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

  // If staff attempts access, redirect immediately to staff operational dashboard
  if (!isManager) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return children;
};

// Smart Role Redirect
const RoleRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'manager' ? '/dashboard' : '/staff/dashboard'} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <WarehouseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Marketing Home Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Authenticated Workspace App Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Auto-redirect root workspace to role dashboard */}
              <Route path="/home" element={<RoleRedirect />} />

              {/* Manager Executive Dashboard (Protected) */}
              <Route
                path="/dashboard"
                element={
                  <ManagerRoute>
                    <Dashboard />
                  </ManagerRoute>
                }
              />

              {/* Warehouse Staff Operations Dashboard */}
              <Route path="/staff/dashboard" element={<StaffDashboard />} />

              {/* Shared Operational Views with Role Capabilities */}
              <Route path="/products" element={<ProductsList />} />
              <Route path="/inventory/operations" element={<Operations />} />
              <Route path="/inventory/ledger" element={<StockLedger />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/smart-insights" element={<SmartInsights />} />

              {/* Manager-Only Financial Analytics */}
              <Route
                path="/analytics/sales"
                element={
                  <ManagerRoute>
                    <SalesAnalytics />
                  </ManagerRoute>
                }
              />
              <Route
                path="/analytics/profit"
                element={
                  <ManagerRoute>
                    <ProfitAnalytics />
                  </ManagerRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WarehouseProvider>
    </AuthProvider>
  );
};

export default App;
