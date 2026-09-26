import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const WarehouseContext = createContext(null);

export const WarehouseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchWarehouses = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.warehouses.list();
      if (res.success) {
        setWarehouses(res.warehouses);
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWarehouses();
    }
  }, [isAuthenticated]);

  const selectedWarehouse =
    selectedWarehouseId === 'all'
      ? null
      : warehouses.find((w) => w._id === selectedWarehouseId) || null;

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouseId,
        selectedWarehouse,
        setSelectedWarehouseId,
        reloadWarehouses: fetchWarehouses,
        loading,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
