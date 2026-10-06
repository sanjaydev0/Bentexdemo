import React, { useState } from 'react';
import { Order, StoreConfig } from '../../types/store';
import { X, Printer, Share2, ShieldCheck, Copy, Check } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  config: StoreConfig;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, config, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!order) return null;

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // Fallback
    }
  };

  const getBillText = () => {
    let itemsText = '';
    order.items.forEach((item, idx) => {
      itemsText += `${idx + 1}. ${item.title} (${item.variant || 'Standard'}) x ${item.quantity} = ${config.currency}${item.price * item.quantity}\n`;
    });

    return `🧾 *INVOICE / CASH BILL - ${config.name.toUpperCase()}*
---------------------------------
*Invoice No:* #${order.id}
*Date:* ${order.date}
*Customer:* ${order.customer.name} (${order.customer.phone})
*Address:* Door ${order.customer.doorNumber}, ${order.customer.street}, ${order.customer.townPincode}

*Items:*
${itemsText}
---------------------------------
• Subtotal: ${config.currency}${order.subtotal}
• Delivery: ${order.deliveryFee === 0 ? 'FREE' : `${config.currency}${order.deliveryFee}`}
• Discount: ${order.discount > 0 ? `-${config.currency}${order.discount}` : '₹0'}
• *Grand Total: ${config.currency}${order.total}*
• Payment Mode: ${order.customer.paymentMode}
• Status: ${order.status}

Thank you for choosing ${config.name}!
For polish service or inquiries, call ${config.displayPhone}.`;
  };

  const handleCopyBill = () => {
    navigator.clipboard.writeText(getBillText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOnWhatsApp = () => {
    const billMsg = getBillText();
    try {
      window.open(`https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(billMsg)}`, '_blank');
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        {/* Modal Controls Header (Hidden on print) */}
        <div className="p-3 sm:p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
              Order #{order.id}
            </span>
            <span className="text-xs text-stone-500">Automated Tax / Estimate Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBill}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Bill Text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Bill</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareOnWhatsApp}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Bill via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp Bill</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-800 font-sans print:p-0" id="printable-invoice">
          
          {/* Store Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-stone-900 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-800 flex items-center justify-center text-white font-serif font-black text-xl">
                  S
                </div>
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-950 tracking-tight">
                  {config.name}
                </h1>
              </div>
              <p className="text-xs text-stone-600 mt-1">{config.tagline}</p>
              <p className="text-xs text-stone-600">
                {config.townAddress}, Pincode: {config.pincode}
              </p>
              <p className="text-xs text-stone-600">
                Phone: {config.displayPhone} | WhatsApp: +{config.phone}
              </p>
              {config.gstNumber && (
                <p className="text-[11px] font-mono font-medium text-stone-500 mt-0.5">
                  GSTIN: {config.gstNumber}
                </p>
              )}
            </div>

            <div className="sm:text-right border-l sm:border-l-0 pl-3 sm:pl-0 border-stone-200">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 block sm:inline-block">
                TAX / ESTIMATE INVOICE
              </span>
              <div className="mt-2 text-xs space-y-0.5 text-stone-600">
                <p><strong>Invoice No:</strong> #{order.id}</p>
                <p><strong>Date &amp; Time:</strong> {order.date}</p>
                <p><strong>Payment Mode:</strong> {order.customer.paymentMode}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-emerald-800">{order.status}</span></p>
              </div>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Billed To Customer:
              </span>
              <p className="font-bold text-sm text-stone-900 mt-0.5">{order.customer.name}</p>
              <p className="text-stone-700">Mobile: +91 {order.customer.phone}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Delivery Location:
              </span>
              <p className="text-stone-700 mt-0.5">
                Door {order.customer.doorNumber}, {order.customer.street}
              </p>
              <p className="text-stone-700">
                Landmark: {order.customer.landmark || 'Town Area'}, {order.customer.townPincode}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-300 text-stone-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2 px-1">#</th>
                  <th className="py-2 px-2">Item Description &amp; Size</th>
                  <th className="py-2 px-2 text-right">Unit Rate</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-1 font-mono text-stone-400">{idx + 1}</td>
                    <td className="py-2.5 px-2">
                      <p className="font-semibold text-stone-900">{item.title}</p>
                      {item.variant && (
                        <span className="text-[11px] text-amber-800">
                          Selected Option: {item.variant}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-serif">
                      {config.currency}{item.price}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-right font-serif font-bold text-stone-900">
                      {config.currency}{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="border-t border-stone-200 pt-3 flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-xs text-stone-600 max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Micro Polish Quality Card</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                Authentic 1-gram gold plated jewellery. Keep away from direct perfumes, chemicals &amp; water. Free polish cleaning service within 6 months at our counter.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-serif">{config.currency}{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span>{order.deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `${config.currency}${order.deliveryFee}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Special Discount:</span>
                  <span>-{config.currency}{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t-2 border-stone-900">
                <span>Grand Total:</span>
                <span className="font-serif text-base text-amber-900">
                  {config.currency}{order.total}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Stamp */}
          <div className="border-t border-dashed border-stone-300 pt-4 flex justify-between items-end text-xs text-stone-500">
            <div>
              <p className="font-medium text-stone-700">Thank you for your patronage!</p>
              <p className="text-[10px]">Computer generated invoice valid for warranty &amp; town exchange.</p>
            </div>
            <div className="text-right">
              <div className="h-10 flex items-center justify-end">
                <span className="font-serif italic text-stone-400 text-xs">[Authorized Signatory]</span>
              </div>
              <p className="font-bold text-stone-900">For {config.name}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
