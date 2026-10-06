import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Phone, MessageCircle, MapPin, ShoppingBag, IndianRupee } from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const { customers, config } = useStore();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.street.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessageCustomer = (phone: string, name: string) => {
    const text = `Namaste ${name}! Greetings from ${config.name}. We have new 1-Gram gold & bentex jewellery arrivals at our shop counter. Please feel free to reach out if you need anything!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, phone, or town area..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="text-xs text-stone-500 shrink-0">
          Total Customers: <strong className="text-stone-900">{customers.length}</strong>
        </div>
      </div>

      {/* Customer Directory Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-stone-500 border border-stone-200">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-semibold text-stone-800 text-sm">No customers recorded yet</p>
          <p className="text-xs text-stone-500 mt-1">
            Customers will automatically be listed here as soon as orders are placed via WhatsApp or checkout.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Delivery Area</th>
                  <th className="py-3 px-3 text-center">Orders</th>
                  <th className="py-3 px-3 text-right">Lifetime Spent</th>
                  <th className="py-3 px-3 text-right">Last Ordered</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.phone} className="hover:bg-amber-50/20 transition-colors">
                    {/* Customer Info */}
                    <td className="py-3 px-3">
                      <div>
                        <strong className="text-stone-900 font-semibold text-xs block">{cust.name}</strong>
                        <span className="text-[11px] text-stone-500 font-mono">+91 {cust.phone}</span>
                      </div>
                    </td>

                    {/* Delivery Area */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-1 text-stone-600 max-w-xs">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                        <span className="truncate">Door {cust.doorNumber}, {cust.street}, {cust.townPincode}</span>
                      </div>
                    </td>

                    {/* Orders count */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold font-mono text-xs">
                        {cust.totalOrders}
                      </span>
                    </td>

                    {/* Lifetime Spent */}
                    <td className="py-3 px-3 text-right font-serif font-bold text-stone-950 font-mono tabular-nums text-xs">
                      {config.currency}{cust.totalSpent.toLocaleString('en-IN')}
                    </td>

                    {/* Last Ordered */}
                    <td className="py-3 px-3 text-right text-stone-500 text-[11px]">
                      {cust.lastOrderDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleMessageCustomer(cust.phone, cust.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
