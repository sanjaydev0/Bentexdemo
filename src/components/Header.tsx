import React from 'react';
import { ShoppingBag, Phone, Search, X, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminView,
  setIsAdminView,
  onOpenCart,
  searchQuery,
  setSearchQuery
}) => {
  const { config, cartCount, cartSubtotal } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Clean 3-Zone Header without announcement bar or top admin button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Name (Display Serif Face) */}
          <div className="shrink-0 min-w-0">
            <button
              onClick={() => setIsAdminView(false)}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <h1 className="font-serif font-bold text-lg sm:text-2xl tracking-tight text-stone-950 group-hover:text-amber-900 transition-colors truncate">
                {config.name}
              </h1>
            </button>
          </div>

          {/* Right Actions: Call Store & Shopping Bag */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Call Button */}
            <a
              href={`tel:${config.phone}`}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 border border-stone-200 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Call Counter</span>
            </a>

            {/* Cart Trigger */}
            {!isAdminView && (
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                aria-label={`Shopping Bag, ${cartCount} items`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-mono tabular-nums font-semibold">
                  {config.currency}{cartSubtotal}
                </span>
                {cartCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center -ml-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar (Subdued hairline container in customer view) */}
        {!isAdminView && (
          <div className="mt-2.5 relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chains, lockets, bentex bangles, temple sets, jhumkas, payal, SKU..."
                className="w-full pl-9 pr-9 py-2 bg-stone-50 hover:bg-white focus:bg-white text-xs sm:text-sm text-stone-900 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin indicator banner if currently in owner mode */}
      {isAdminView && (
        <div className="bg-stone-900 text-amber-300 px-4 py-1.5 text-xs flex items-center justify-between border-t border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-medium text-white">Merchant Administration Console Active</span>
          </div>
          <button
            onClick={() => setIsAdminView(false)}
            className="text-amber-300 hover:text-white underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>Return to Storefront</span>
          </button>
        </div>
      )}
    </header>
  );
};
