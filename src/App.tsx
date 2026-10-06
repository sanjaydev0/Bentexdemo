import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Category, Product } from './types/store';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MessageCircle, Phone, Clock, Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Chains',
  'Lockets & Pendants',
  'Bangles',
  'Earrings',
  'Necklace Sets',
  'Mangalsutra',
  'Anklets',
  'Rings & Waistbelts'
];

function StoreContent() {
  const { products, config, cartCount, cartSubtotal } = useStore();

  const [isAdminView, setIsAdminView] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under199' | 'under299' | 'under499' | 'above500'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'newest'>('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [storeToast, setStoreToast] = useState<string | null>(null);

  const showStoreToast = (msg: string) => {
    setStoreToast(msg);
    setTimeout(() => setStoreToast(null), 2500);
  };

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Search (title, sku, category, polish, tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchPolish = p.polishType.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchSku && !matchCat && !matchPolish && !matchTags) {
            return false;
          }
        }

        // Price filter
        if (priceFilter === 'under199' && p.price >= 199) return false;
        if (priceFilter === 'under299' && p.price >= 299) return false;
        if (priceFilter === 'under499' && p.price >= 499) return false;
        if (priceFilter === 'above500' && p.price < 500) return false;

        // In-stock only
        if (inStockOnly && (!p.inStock || p.stockQty <= 0)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        // Default: Popularity (Bestsellers first, then stock)
        const rank = (p: Product) => (p.badge === 'Bestseller' ? 3 : p.badge === 'Trending' ? 2 : 1);
        return rank(b) - rank(a);
      });
  }, [products, selectedCategory, searchQuery, priceFilter, inStockOnly, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    priceFilter !== 'all' ||
    inStockOnly;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceFilter('all');
    setInStockOnly(false);
    setSortBy('popularity');
  };

  // Instant single-item buy on WhatsApp
  const handleInstantBuy = (product: Product, selectedVariant?: string) => {
    const variantText = selectedVariant ? ` (Size/Option: ${selectedVariant})` : '';
    const message = `Namaste ${config.name}! I would like to order:
• *${product.title}*${variantText}
• SKU: ${product.sku}
• Special Price: ${config.currency}${product.price} (MRP: ${config.currency}${product.mrp})

Please let me know if this piece is in stock at your town shop for instant dispatch!`;

    showStoreToast(`Opening WhatsApp order for ${product.title}...`);
    try {
      window.open(`https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`, '_blank');
    } catch {
      // Fallback
    }
  };

  // Render Owner Admin Console if authenticated & toggled
  if (isAdminView) {
    return <AdminPanel onBackToStore={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden w-full max-w-full">
      {/* Toast Feedback */}
      {storeToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 px-4 py-2 rounded-xl text-xs font-medium shadow-xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{storeToast}</span>
        </div>
      )}
      
      {/* Clean Header (Brand Name + Call Store + Cart Button) */}
      <Header
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Direct Storefront: Catalog with Filters & Products (No Black Hero Box) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex-1 w-full space-y-3.5 overflow-hidden box-border">
        
        {/* Category Filters, Budget Rails & Sorting (Fully Contained, No Overflow) */}
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          totalFilteredCount={filteredProducts.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Product Grid: Strict 2-column mobile, 3-4 column desktop */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-stone-200 p-8 shadow-xs max-w-md mx-auto my-4 space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              No products found
            </h3>
            <p className="text-xs text-stone-500">
              {searchQuery
                ? `No jewellery matching "${searchQuery}" in our current stock.`
                : 'No items match your active filters.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Clear Filters &amp; View All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={(p) => setInspectProduct(p)}
                onInstantBuy={handleInstantBuy}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer & Bottom Section: Store Info & Password-Protected Admin Access */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Store Details */}
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                {config.name}
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {config.tagline}. Authentic 1-gram micro gold chains, lockets, bentex bangles, and temple imitation jewellery.
              </p>
              <p className="text-xs text-amber-300 font-medium">
                📍 {config.townAddress}, Pincode: {config.pincode}
              </p>
            </div>

            {/* Shop Timings & Hotline */}
            <div className="space-y-2 text-xs text-stone-400">
              <h4 className="font-semibold text-stone-200 text-xs uppercase tracking-wider">
                Counter Operating Hours
              </h4>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Monday – Sunday: 9:30 AM to 9:30 PM</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>Call Counter: <a href={`tel:${config.phone}`} className="text-amber-300 hover:underline">{config.displayPhone}</a></span>
              </p>
              <p className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp Hotline: +{config.phone}</span>
              </p>
            </div>

            {/* Polish Care & Admin Access */}
            <div className="space-y-2 text-xs text-stone-400">
              <h4 className="font-semibold text-stone-200 text-xs uppercase tracking-wider">
                1-Gram Gold Polish Advice
              </h4>
              <p className="text-xs leading-relaxed text-stone-400">
                Wipe jewellery with a dry, soft cotton cloth after wearing to remove sweat before storing. Keep in separate zip pouches.
              </p>
              
              {/* Bottom Section Protected Admin Access Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Merchant Admin Portal (Login)</span>
                </button>
                <span className="block text-[10px] text-stone-500 mt-0.5">
                  Demo Access: ID <strong>bentexdemo</strong> | Password <strong>bentex123</strong>
                </span>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
            <p>&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
            <p className="text-stone-400">Hyper-Local 1-Gram Gold &amp; Bentex E-Commerce</p>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Cart Bar (Mobile & Desktop) */}
      {cartCount > 0 && !isCartOpen && (
        <aside 
          aria-label="Shopping bag quick checkout"
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-88 z-40 animate-in fade-in slide-in-from-bottom-3"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-stone-900 hover:bg-stone-850 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-800 transition-all cursor-pointer group hover:scale-[1.01]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                {cartCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in Bag
                </p>
                <p className="text-[11px] text-amber-300 font-serif font-bold">
                  {config.currency}{cartSubtotal} · Click to Order
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 group-hover:translate-x-0.5 transition-transform pr-1">
              <span>View Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </aside>
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${config.phone}?text=${encodeURIComponent(`Namaste ${config.name}! I am browsing your online catalog and have an inquiry.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-5 z-35 bg-emerald-700 hover:bg-emerald-800 text-white p-3 sm:px-4 sm:py-2.5 rounded-full shadow-lg flex items-center gap-2 font-medium text-xs transition-all hover:scale-103 active:scale-95 ${
          cartCount > 0 ? 'bottom-20 sm:bottom-20' : 'bottom-5'
        }`}
        title="Chat with Store on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        <span className="hidden sm:inline">WhatsApp Counter</span>
      </a>

      {/* Password-Protected Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setIsAdminView(true);
        }}
      />

      {/* Product Quick-View Modal */}
      <ProductModal
        product={inspectProduct}
        onClose={() => setInspectProduct(null)}
        onInstantBuy={handleInstantBuy}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
