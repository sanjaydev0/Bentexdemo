import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types/store';
import { Search, Filter, MessageCircle, FileText, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const OrderManager: React.FC = () => {
  const { orders, config, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const statuses: OrderStatus[] = ['New', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Packed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const handleSendWhatsAppStatusUpdate = (order: Order) => {
    let updateText = '';
    switch (order.status) {
      case 'Confirmed':
        updateText = `Namaste ${order.customer.name}! Your order *#${order.id}* from ${config.name} has been CONFIRMED. Our craftsmen are preparing your pieces with care.`;
        break;
      case 'Packed':
        updateText = `Namaste ${order.customer.name}! Good news! Your jewellery order *#${order.id}* is PACKED in velvet pouch with warranty card and ready for dispatch.`;
        break;
      case 'Out for Delivery':
        updateText = `Namaste ${order.customer.name}! Order *#${order.id}* is OUT FOR LOCAL DELIVERY to your address (Door ${order.customer.doorNumber}, ${order.customer.street}). Total payable: ${config.currency}${order.total} (${order.customer.paymentMode}).`;
        break;
      case 'Delivered':
        updateText = `Namaste ${order.customer.name}! Your order *#${order.id}* has been DELIVERED. Thank you for shopping at ${config.name}! Please remember: avoid perfumes/sprays on 1-gram gold polish.`;
        break;
      default:
        updateText = `Namaste ${order.customer.name}! Regarding your order *#${order.id}* for ${config.currency}${order.total} from ${config.name}: our current status is *${order.status}*.`;
        break;
    }

    const waUrl = `https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(updateText)}`;
    showToast(`WhatsApp message prepared for ${order.customer.name}`);
    try {
      window.open(waUrl, '_blank');
    } catch {
      // Handled
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-stone-900 text-amber-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg border border-amber-800/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer name, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 text-[11px] rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === st
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-stone-500 border border-stone-200">
          <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-semibold text-stone-800 text-sm">No orders matching current filter</p>
          <p className="text-xs text-stone-500 mt-1">Try switching to &quot;All Orders&quot; or clearing your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all p-4 space-y-3"
            >
              {/* Card Header: Order ID, Date, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    #{order.id}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" /> {order.date}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-500 font-medium">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const newSt = e.target.value as OrderStatus;
                        updateOrderStatus(order.id, newSt);
                        showToast(`Order #${order.id} updated to ${newSt}`);
                      }}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Body: Customer & Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer Details */}
                <div className="space-y-1 bg-stone-50/70 p-3 rounded-lg border border-stone-200/60">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900 text-sm">{order.customer.name}</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                      {order.customer.paymentMode}
                    </span>
                  </div>

                  <p className="text-stone-700 flex items-center gap-1.5 pt-0.5">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <a href={`tel:${order.customer.phone}`} className="hover:underline font-mono">
                      +91 {order.customer.phone}
                    </a>
                  </p>

                  <p className="text-stone-600 flex items-start gap-1.5 pt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                    <span>
                      Door {order.customer.doorNumber}, {order.customer.street}, {order.customer.landmark ? `(Near ${order.customer.landmark}), ` : ''}{order.customer.townPincode}
                    </span>
                  </p>
                </div>

                {/* Items Ordered */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block">
                    Items in Order ({order.items.reduce((a, b) => a + b.quantity, 0)} pcs):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 rounded-lg border border-stone-100 bg-white"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 truncate text-[11px]">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {item.variant ? `Option: ${item.variant} · ` : ''}
                            Qty: {item.quantity} × {config.currency}{item.price}
                          </p>
                        </div>
                        <span className="font-serif font-bold text-stone-950 text-xs shrink-0">
                          {config.currency}{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Financials and Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="text-stone-500">Total Payable:</span>
                  <span className="text-base font-bold font-serif text-amber-950">
                    {config.currency}{order.total}
                  </span>
                  {order.discount > 0 && (
                    <span className="text-[11px] text-emerald-700">
                      (Includes -{config.currency}{order.discount} discount)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Status Update */}
                  <button
                    onClick={() => handleSendWhatsAppStatusUpdate(order)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium border border-emerald-300 flex items-center gap-1.5 transition-colors"
                    title="Send WhatsApp update to customer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Update</span>
                  </button>

                  {/* Print Invoice Button */}
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>Print Bill</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        config={config}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
