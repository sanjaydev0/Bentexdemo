import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreConfig } from '../../types/store';
import { Save, RotateCcw, Check, Store, Phone, MapPin, QrCode, Truck, ExternalLink, ShieldCheck } from 'lucide-react';

export const StoreSettings: React.FC = () => {
  const { config, updateConfig, resetDemoData } = useStore();
  const [formData, setFormData] = useState<StoreConfig>(config);
  const [saved, setSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Synchronize form whenever config changes (e.g. on reset or external update)
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize phone number: strip non-digits
    let cleanPhone = formData.phone.replace(/\D/g, '');
    // If entered as 10 digits (common in India), prefix 91
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const payload: StoreConfig = {
      ...formData,
      phone: cleanPhone,
      freeDeliveryThreshold: Number(formData.freeDeliveryThreshold) || 0,
      defaultDeliveryFee: Number(formData.defaultDeliveryFee) || 0
    };

    updateConfig(payload);
    setFormData(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestWhatsApp = () => {
    let cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const testMsg = `Namaste! This is a test message from ${formData.name} WhatsApp order dispatch engine. Your store settings are verified and working properly!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(testMsg)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Success Notification Banner */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              Store configuration updated and saved successfully!
            </span>
          </div>
          <span className="text-[11px] text-emerald-700">All customer WhatsApp routes and store displays are now active.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900">Store Profile &amp; Order Rules</h2>
            <p className="text-xs text-stone-500">Configure your local town store details, WhatsApp routing, and delivery rules.</p>
          </div>
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-xs">
          {/* Store Name & Tagline */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
              <Store className="w-3.5 h-3.5" /> Identity &amp; Branding
            </h3>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Top Announcement Bar Text (if enabled)</label>
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          {/* Contact & WhatsApp routing */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
                <Phone className="w-3.5 h-3.5" /> WhatsApp Order Hotline &amp; Calling
              </h3>
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-semibold underline cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Test WhatsApp Ping</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Owner WhatsApp Phone (10 or 12 digits, e.g. 9876543210 or 919876543210) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs focus:outline-none focus:border-stone-500"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  All customer WhatsApp order checkouts and status updates dispatch to this number.
                </span>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Display Calling Phone</label>
                <input
                  type="text"
                  value={formData.displayPhone}
                  onChange={(e) => setFormData({ ...formData, displayPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-500"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Formatted telephone number shown to customers for one-tap calling.
                </span>
              </div>
            </div>
          </div>

          {/* Physical Address & Town */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h3 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
              <MapPin className="w-3.5 h-3.5" /> Town Shop Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">Shop Address &amp; Landmark</label>
                <input
                  type="text"
                  value={formData.townAddress}
                  onChange={(e) => setFormData({ ...formData, townAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-500"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Town Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">GSTIN (Optional for printed invoices)</label>
              <input
                type="text"
                value={formData.gstNumber || ''}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="e.g. 37AAACS1234F1Z8"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs focus:outline-none focus:border-stone-500"
              />
            </div>
          </div>

          {/* Payment & Delivery Rules */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <h3 className="font-bold text-stone-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900">
              <QrCode className="w-3.5 h-3.5" /> Payments &amp; Delivery
            </h3>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Merchant UPI ID (for instant QR code generation) *</label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. swarnajewels@okhdfcbank"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs focus:outline-none focus:border-stone-500"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Customers selecting &quot;UPI on Delivery&quot; scan this QR code directly with Google Pay, PhonePe, or Paytm.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <label className="font-semibold text-stone-700 block mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-700" /> Free Town Delivery Threshold (₹)
                </label>
                <input
                  type="number"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">Orders at or above this get free delivery.</span>
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={formData.defaultDeliveryFee}
                  onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">Charged if order is below free threshold.</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-stone-500 hover:text-rose-600 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Catalog</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">Reset Demo Data?</h4>
            <p className="text-xs text-stone-500">
              This will restore all default 1-gram gold catalog items, stock counts, sample orders, and original store settings.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
