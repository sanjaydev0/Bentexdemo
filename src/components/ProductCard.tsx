import React, { useState } from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, ShoppingBag, Eye, Zap, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onInstantBuy: (product: Product, selectedVariant?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onInstantBuy
}) => {
  const { cart, addToCart, updateCartQty, config } = useStore();
  
  // Default to first variant if exists
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [imageError, setImageError] = useState(false);
  const [showAddedFlash, setShowAddedFlash] = useState(false);

  // Check if item with this variant is already in cart
  const cartItem = cart.find(
    (item) => item.product.id === product.id && item.selectedVariant === selectedVariant
  );
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockQty <= 0) return;
    
    addToCart(product, selectedVariant, 1);
    setShowAddedFlash(true);
    setTimeout(() => setShowAddedFlash(false), 900);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (qtyInCart >= product.stockQty) return;
    updateCartQty(product.id, selectedVariant, qtyInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQty(product.id, selectedVariant, qtyInCart - 1);
  };

  const handleInstantBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInstantBuy(product, selectedVariant);
  };

  return (
    <article
      onClick={() => onOpenQuickView(product)}
      className="group relative bg-white border border-stone-200 hover:border-stone-400/80 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer rounded-xl hover:-translate-y-0.5"
    >
      {/* Product Image Container (4:5 ratio, 65-75% visual weight) */}
      <div className="relative aspect-[4/5] w-full bg-stone-100 overflow-hidden">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 p-4 text-center">
            <span className="text-2xl mb-1 text-amber-800 font-serif">S</span>
            <span className="text-xs font-serif font-medium text-stone-700">{product.title}</span>
            <span className="text-[11px] text-stone-500 mt-1">{product.polishType}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
          />
        )}

        {/* At most 1 subtle, quiet text tag (Zero-Pill discipline) */}
        {product.badge && product.inStock && product.stockQty > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-stone-900/90 text-stone-100 backdrop-blur-xs">
              {product.badge}
            </span>
          </div>
        )}

        {product.stockQty <= 4 && product.stockQty > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[10px] font-medium text-amber-900 bg-amber-50/90 border border-amber-200 px-1.5 py-0.5 rounded backdrop-blur-xs">
              Only {product.stockQty} left
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {(!product.inStock || product.stockQty <= 0) && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-stone-100 font-medium text-xs tracking-wider uppercase bg-stone-950 px-2.5 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Hover Indicator */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-stone-800 text-[11px] font-medium px-2 py-1 rounded shadow-xs flex items-center gap-1">
          <Eye className="w-3 h-3 text-stone-500" />
          <span>Quick View</span>
        </div>
      </div>

      {/* Card Body Area */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          {/* Zero-Pill Unboxed Metadata Kicker with typographic separator */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
            <span className="text-amber-900">{product.polishType}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="truncate">{product.category}</span>
          </div>

          {/* Product Title (Editorial Serif face, text-wrap: balance) */}
          <h3 className="font-serif font-medium text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-900 transition-colors [text-wrap:balance]">
            {product.title}
          </h3>
        </div>

        {/* Variant Selectors (Functional Segmented Buttons with clean states) */}
        {product.variants.length > 0 && (
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
              <span>Size / Variant:</span>
              <span className="font-medium text-stone-900">{selectedVariant}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.variants.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border cursor-pointer ${
                    selectedVariant === v
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Row (Tabular Numerals) */}
        <div className="pt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-serif font-bold text-stone-950 font-mono tabular-nums">
            {config.currency}{product.price}
          </span>
          <span className="text-xs text-stone-600 line-through font-mono tabular-nums">
            {config.currency}{product.mrp}
          </span>
          {discountPercent > 0 && (
            <span className="text-[11px] font-medium text-emerald-800">
              {discountPercent}% off
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center gap-1.5 border-t border-stone-100 mt-auto" onClick={(e) => e.stopPropagation()}>
          {/* Dual-State Button */}
          {qtyInCart > 0 ? (
            <div className="flex-1 flex items-center justify-between bg-stone-100 rounded-lg p-0.5 text-xs font-semibold text-stone-900">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded flex items-center justify-center bg-white text-stone-700 hover:bg-stone-200 active:scale-95 transition-all border border-stone-200 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono tabular-nums font-bold">{qtyInCart}</span>
              <button
                onClick={handleIncrement}
                disabled={qtyInCart >= product.stockQty}
                className="w-7 h-7 rounded flex items-center justify-center bg-stone-900 text-white hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stockQty <= 0}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                showAddedFlash
                  ? 'bg-emerald-700 text-white'
                  : product.inStock && product.stockQty > 0
                  ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              {showAddedFlash ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          )}

          {/* Direct 1-Tap WhatsApp "Buy Now" Lightning Button */}
          <button
            onClick={handleInstantBuyClick}
            disabled={!product.inStock || product.stockQty <= 0}
            title="Instant WhatsApp Order"
            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white border border-emerald-300 flex items-center justify-center transition-colors active:scale-95 shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </article>
  );
};
