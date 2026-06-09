import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [items]
  );

  const syncCart = useCallback((data) => {
    setItems(data?.products || []);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getCart(token);
      syncCart(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, syncCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      if (!token) throw new Error('Please sign in to add items to cart');
      const res = await addToCart(token, productId, quantity);
      syncCart(res.data);
      return res;
    },
    [token, syncCart]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (!token) throw new Error('Please sign in');
      const res = await updateCartItem(token, productId, quantity);
      syncCart(res.data);
      return res;
    },
    [token, syncCart]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!token) throw new Error('Please sign in');
      const res = await removeFromCart(token, productId);
      syncCart(res.data);
      return res;
    },
    [token, syncCart]
  );

  const clearAll = useCallback(async () => {
    if (!token) throw new Error('Please sign in');
    const res = await clearCart(token);
    syncCart(res.data);
    return res;
  }, [token, syncCart]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const value = {
    items,
    loading,
    error,
    cartCount,
    cartTotal,
    sidebarOpen,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    refreshCart,
    openSidebar,
    closeSidebar,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

export default CartContext;
