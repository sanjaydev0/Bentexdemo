import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { StoreConfig } from '../types/store';
import QRCode from 'qrcode';

interface UPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  amount: number;
  orderId?: string;
  onPaymentConfirmed?: () => void;
}

export const UPIModal: React.FC<UPIModalProps> = ({
  isOpen,
  onClose,
  config,
  amount,
  orderId,
  onPaymentConfirmed
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Encode UPI intent URL
  const upiIntent = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent(
    config.name
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderId ? `Order ${orderId}` : 'Jewellery Purchase')}`;

  useEffect(() => {
    if (isOpen && upiIntent) {
      QRCode.toDataURL(upiIntent, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#1c1917', // stone-900
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, upiIntent]);

  if (!isOpen) return null;

  const copyUpiId = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-stone-900">Scan &amp; Pay via UPI</h3>
        <p className="text-xs text-stone-500">Google Pay / PhonePe / Paytm / BHIM</p>

        {/* Amount to pay */}
        <div className="my-2.5 py-1.5 px-3 bg-stone-50 rounded-xl border border-stone-200 inline-block">
          <span className="text-[11px] text-stone-500 block">Total Amount to Pay</span>
          <span className="text-xl font-bold font-serif text-stone-950">
            {config.currency}{amount}
          </span>
          {orderId && (
            <span className="text-[10px] text-amber-800 font-mono block mt-0.5">
              Ref: #{orderId}
            </span>
          )}
        </div>

        {/* Instant Vector QR Code */}
        <div className="w-52 h-52 mx-auto bg-white p-2 rounded-xl border-2 border-dashed border-emerald-400 flex items-center justify-center shadow-xs">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="UPI QR Code"
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div className="text-xs text-stone-400 flex items-center justify-center h-full">
              Generating QR...
            </div>
          )}
        </div>

        {/* Direct UPI App launcher for mobile devices */}
        <div className="mt-2.5">
          <a
            href={upiIntent}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>Tap to open installed UPI App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* UPI ID Copy Field */}
        <div className="mt-3 p-2 bg-stone-100 rounded-lg flex items-center justify-between text-xs">
          <div className="text-left overflow-hidden">
            <span className="text-[10px] text-stone-500 block uppercase font-medium">Store UPI ID</span>
            <span className="font-mono font-semibold text-stone-900 truncate block">
              {config.upiId}
            </span>
          </div>
          <button
            onClick={copyUpiId}
            className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-800 rounded border border-stone-200 font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Trust badge */}
        <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Store account: <strong>{config.name}</strong></span>
        </div>

        {/* Finish button */}
        <button
          onClick={() => {
            if (onPaymentConfirmed) onPaymentConfirmed();
            onClose();
          }}
          className="mt-3.5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>I Have Completed Payment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
