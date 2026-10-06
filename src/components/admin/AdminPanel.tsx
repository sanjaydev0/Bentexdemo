import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { InventoryManager } from './InventoryManager';
import { OrderManager } from './OrderManager';
import { CustomerManager } from './CustomerManager';
import { StoreSettings } from './StoreSettings';
import { LayoutDashboard, Package, ShoppingBag, Settings, Store, Users } from 'lucide-react';

interface AdminPanelProps {
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore }) => {
  const { orders, products, customers } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'customers' | 'settings'>('dashboard');

  const pendingOrdersCount = orders.filter((o) => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Packed').length;
  const lowStockCount = products.filter((p) => p.stockQty <= 5).length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Admin Subheader & Navigation Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2.5">
            
            {/* Admin Title & Back Button */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                    Merchant Administration
                  </h1>
                  <p className="text-[11px] text-stone-500">Live Inventory &amp; Order Dispatch Console</p>
                </div>
              </div>

              <button
                onClick={onBackToStore}
                className="inline-flex sm:hidden items-center gap-1 text-xs font-semibold text-stone-900 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-300"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store</span>
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer relative ${
                  activeTab === 'inventory'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory &amp; Stock</span>
                {lowStockCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {lowStockCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer relative ${
                  activeTab === 'orders'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order Pipeline</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer relative ${
                  activeTab === 'customers'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
                {customers.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-medium">
                    {customers.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Store Profile &amp; Rules</span>
              </button>

              {/* Desktop Back to Store Button */}
              <button
                onClick={onBackToStore}
                className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 border border-stone-300 transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Customer Storefront</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Tab View Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateToTab={(t) => setActiveTab(t)} />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'customers' && <CustomerManager />}
        {activeTab === 'settings' && <StoreSettings />}
      </main>
    </div>
  );
};
