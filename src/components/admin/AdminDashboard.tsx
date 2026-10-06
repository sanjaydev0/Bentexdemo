import React from 'react';
import { useStore } from '../../context/StoreContext';
import { IndianRupee, ShoppingBag, AlertTriangle, TrendingUp, Package, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToTab: (tab: 'inventory' | 'orders' | 'customers' | 'settings') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToTab }) => {
  const { products, orders, config } = useStore();

  // Financial calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const totalUnitsSold = orders.reduce(
    (acc, o) => acc + (o.status !== 'Cancelled' ? o.items.reduce((sum, item) => sum + item.quantity, 0) : 0),
    0
  );

  const pendingOrders = orders.filter((o) => o.status === 'New' || o.status === 'Confirmed' || o.status === 'Packed');
  const lowStockProducts = products.filter((p) => p.stockQty <= 5);
  const totalInventoryUnits = products.reduce((acc, p) => acc + p.stockQty, 0);

  // Profit calculation
  const estimatedCost = orders.reduce((acc, o) => {
    if (o.status === 'Cancelled') return acc;
    const orderCost = o.items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cp = prod?.costPrice || Math.round(item.price * 0.45);
      return sum + cp * item.quantity;
    }, 0);
    return acc + orderCost;
  }, 0);

  const estimatedProfit = Math.max(0, totalRevenue - estimatedCost);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.stockQty;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            Town Merchant Control Center
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100 mt-1">
            {config.name} — Store Intelligence
          </h2>
          <p className="text-xs text-stone-300 mt-0.5">
            Real-time daily sales, WhatsApp order fulfillment, and local stock tracker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Manage Orders ({pendingOrders.length} pending)</span>
          </button>
          <button
            onClick={() => onNavigateToTab('inventory')}
            className="px-3.5 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stock &amp; Pricing</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Recorded Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {config.currency}{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Est. Gross Profit: {config.currency}{estimatedProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Orders Placed</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {orders.length}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            <strong>{pendingOrders.length}</strong> active orders in town pipeline
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Units Sold</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {totalUnitsSold} pcs
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {totalInventoryUnits} items currently in store stock
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-rose-600">
            {lowStockProducts.length}
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">
            {lowStockProducts.length > 0 ? 'Restock needed immediately' : 'Inventory healthy'}
          </div>
        </div>
      </div>

      {/* 2-Column: Category Stock Distribution + Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3">
            Inventory Stock Distribution by Category
          </h3>
          <div className="space-y-2.5">
            {Object.entries(categoryCounts).map(([cat, qty]) => {
              const pct = Math.round((qty / (totalInventoryUnits || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-stone-800">{cat}</span>
                    <span className="text-stone-500">{qty} pcs ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Items Action Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning List (&le; 5 units)
              </h3>
              <button
                onClick={() => onNavigateToTab('inventory')}
                className="text-xs text-amber-800 hover:underline font-medium"
              >
                View in Inventory &rarr;
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-medium text-stone-700">All jewellery items have adequate stock!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-8 h-10 object-cover rounded bg-stone-200"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 truncate max-w-[180px]">
                          {p.title}
                        </p>
                        <span className="text-[10px] text-stone-500">{p.category} · {p.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded font-bold font-mono text-xs bg-rose-100 text-rose-800 block">
                        {p.stockQty} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 mt-4 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Wholesale replenishment recommended</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="font-semibold text-amber-900 hover:text-amber-800 flex items-center gap-0.5"
            >
              <span>Add Stock</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600">
            Recent Town Orders
          </h3>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs text-amber-800 hover:underline font-medium"
          >
            View All ({orders.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2">Order ID</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-center">Payment</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/60">
                  <td className="py-2.5 font-mono font-bold text-stone-900">#{o.id}</td>
                  <td className="py-2.5">
                    <p className="font-semibold text-stone-800">{o.customer.name}</p>
                    <span className="text-[10px] text-stone-500">+91 {o.customer.phone}</span>
                  </td>
                  <td className="py-2.5 text-stone-500 text-[11px]">{o.date}</td>
                  <td className="py-2.5 text-right font-serif font-bold text-stone-950">
                    {config.currency}{o.total}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {o.customer.paymentMode}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
