import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, CustomerDetails, StoreConfig, OrderStatus, Coupon, CustomerRecord } from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_STORE_CONFIG, INITIAL_ORDERS, INITIAL_COUPONS } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  config: StoreConfig;
  coupons: Coupon[];
  customers: CustomerRecord[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  freeDeliveryRemaining: number;
  addToCart: (product: Product, variant?: string, quantity?: number) => void;
  updateCartQty: (productId: string, variant: string | undefined, qty: number) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  clearCart: () => void;
  createOrder: (customer: CustomerDetails, discount: number, couponCode?: string) => Order;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  bulkAddProducts: (productsList: Omit<Product, 'id'>[]) => void;
  replaceProducts: (productsList: Product[]) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateConfig: (newConfig: StoreConfig) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LS_PRODUCTS_KEY = 'swarna_products_v2';
const LS_ORDERS_KEY = 'swarna_orders_v2';
const LS_CONFIG_KEY = 'swarna_config_v2';
const LS_CART_KEY = 'swarna_cart_v2';
const LS_COUPONS_KEY = 'swarna_coupons_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LS_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LS_ORDERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem(LS_CONFIG_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STORE_CONFIG;
    } catch {
      return INITIAL_STORE_CONFIG;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(LS_COUPONS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LS_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_COUPONS_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons to localStorage', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Derived Customer Records for CRM
  const customers = useMemo<CustomerRecord[]>(() => {
    const customerMap = new Map<string, CustomerRecord>();
    orders.forEach((o) => {
      const key = o.customer.phone.trim();
      const existing = customerMap.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += o.total;
        existing.lastOrderDate = o.date;
      } else {
        customerMap.set(key, {
          phone: o.customer.phone,
          name: o.customer.name,
          doorNumber: o.customer.doorNumber,
          street: o.customer.street,
          townPincode: o.customer.townPincode,
          totalOrders: 1,
          totalSpent: o.total,
          lastOrderDate: o.date
        });
      }
    });
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Cart calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = cartSubtotal >= config.freeDeliveryThreshold || cartSubtotal === 0 ? 0 : config.defaultDeliveryFee;
  const freeDeliveryRemaining = Math.max(0, config.freeDeliveryThreshold - cartSubtotal);

  const addToCart = (product: Product, variant?: string, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { product, selectedVariant: variant, quantity }];
      }
    });
  };

  const updateCartQty = (productId: string, variant: string | undefined, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedVariant === variant
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedVariant === variant)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = (customer: CustomerDetails, discount: number, couponCode?: string): Order => {
    const newOrderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newOrder: Order = {
      id: newOrderId,
      date: dateStr,
      customer,
      items: cart.map((c) => ({
        productId: c.product.id,
        title: c.product.title,
        variant: c.selectedVariant,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.image
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      discount,
      couponCode,
      total: Math.max(0, cartSubtotal + deliveryFee - discount),
      status: 'New'
    };

    // Decrement inventory stock
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = cart.find((c) => c.product.id === p.id);
        if (orderedItem) {
          const newQty = Math.max(0, p.stockQty - orderedItem.quantity);
          return {
            ...p,
            stockQty: newQty,
            inStock: newQty > 0
          };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const addProduct = (newProdData: Omit<Product, 'id'>): Product => {
    const newId = `p${Date.now()}`;
    const newProduct: Product = {
      ...newProdData,
      id: newId
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      try {
        localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    return newProduct;
  };

  const bulkAddProducts = (productsList: Omit<Product, 'id'>[]) => {
    const timestamp = Date.now();
    const formatted: Product[] = productsList.map((p, index) => ({
      ...p,
      id: `p${timestamp}_${index}`
    }));
    setProducts((prev) => [...formatted, ...prev]);
  };

  const replaceProducts = (productsList: Product[]) => {
    setProducts(productsList);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextQty = Math.max(0, p.stockQty + delta);
          return {
            ...p,
            stockQty: nextQty,
            inStock: nextQty > 0
          };
        }
        return p;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateConfig = (newConfig: StoreConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(LS_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `c_${Date.now()}`
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setConfig(INITIAL_STORE_CONFIG);
    setCoupons(INITIAL_COUPONS);
    setCart([]);
    localStorage.removeItem(LS_PRODUCTS_KEY);
    localStorage.removeItem(LS_ORDERS_KEY);
    localStorage.removeItem(LS_CONFIG_KEY);
    localStorage.removeItem(LS_COUPONS_KEY);
    localStorage.removeItem(LS_CART_KEY);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        config,
        coupons,
        customers,
        cart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        freeDeliveryRemaining,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createOrder,
        addProduct,
        bulkAddProducts,
        replaceProducts,
        updateProduct,
        deleteProduct,
        adjustStock,
        updateOrderStatus,
        updateConfig,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        resetDemoData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
