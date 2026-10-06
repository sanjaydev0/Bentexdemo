import React, { useState } from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { X, Shield, Sparkles, Check, ShoppingBag, MessageCircle, Video, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantBuy: (product: Product, variant?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onInstantBuy
}) => {
  if (!product) return null;

  const { addToCart, config } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [added, setAdded] = useState(false);

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAdd = () => {
    addToCart(product, selectedVariant, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWhatsAppInquiry = () => {
    const text = `Namaste ${config.name}! I am interested in viewing *${product.title}* (SKU: ${product.sku}, Price: ${config.currency}${product.price}). Could you please share a video or live pictures on WhatsApp?`;
    try {
      window.open(`https://wa.me/${config.phone}?text=${encodeURIComponent(text)}`, '_blank');
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 shadow-md border border-stone-200 flex items-center justify-center transition-transform active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Image & Guarantee Seal */}
          <div className="flex flex-col gap-2">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-amber-800 text-amber-100 text-xs font-bold px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                {product.polishType}
              </div>
            </div>

            {/* Video Call Inspection Callout */}
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Request Live Video Call Inspection</span>
            </button>
          </div>

          {/* Details & Specs */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-stone-100">
                <span>{product.category}</span>
                <span className="font-mono">SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-950 mt-2 leading-snug">
                {product.title}
              </h2>

              {/* Price & Discount */}
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-2xl font-bold text-amber-900 font-serif">
                  {config.currency}{product.price}
                </span>
                <span className="text-sm text-stone-600 line-through">
                  MRP {config.currency}{product.mrp}
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="mt-2 text-xs flex items-center gap-1.5">
                {product.inStock && product.stockQty > 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock ({product.stockQty} units in town store)
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <label className="text-xs font-semibold text-stone-900 block mb-1.5">
                    Select Size / Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedVariant === v
                            ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-600 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Quality & Care Badges */}
              <div className="mt-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-950">
                      {product.warrantyMonths}-Month Polish Durability Guarantee
                    </span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Coated with double-layer micro lacquer to prevent tarnishing from everyday sweat and humidity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t border-amber-200/50">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900/80">
                    <strong>Care Advice:</strong> Avoid direct perfume spray, store wrapped in a cotton or velvet pouch.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                disabled={!product.inStock || product.stockQty <= 0}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95 shadow-xs'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onInstantBuy(product, selectedVariant)}
                disabled={!product.inStock || product.stockQty <= 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Buy via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
