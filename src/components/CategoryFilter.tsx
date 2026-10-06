import React from 'react';
import { Category } from '../types/store';
import { Check, Filter, RotateCcw } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  priceFilter: 'all' | 'under199' | 'under299' | 'under499' | 'above500';
  setPriceFilter: (filter: 'all' | 'under199' | 'under299' | 'under499' | 'above500') => void;
  sortBy: 'popularity' | 'price-asc' | 'price-desc' | 'newest';
  setSortBy: (sort: 'popularity' | 'price-asc' | 'price-desc' | 'newest') => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  totalFilteredCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
  inStockOnly,
  setInStockOnly,
  totalFilteredCount,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div id="catalog" className="w-full max-w-full space-y-2.5 pb-2 pt-1 border-b border-stone-200 overflow-hidden box-border">
      
      {/* Category Pills - Clean Wrapped Layout (Never overflows or causes side drag) */}
      <div className="w-full flex flex-wrap gap-1.5 sm:gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-semibold'
                  : 'bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 border-stone-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar - Fully contained on mobile */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
        
        {/* Quick Budget Filters (Wrapped, no side drag) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-500 font-medium shrink-0 flex items-center gap-1 mr-0.5 text-[11px]">
            <Filter className="w-3 h-3 text-stone-500" /> Budget:
          </span>
          {[
            { id: 'all', label: 'All Rates' },
            { id: 'under199', label: 'Under ₹199' },
            { id: 'under299', label: 'Under ₹299' },
            { id: 'under499', label: 'Under ₹499' },
            { id: 'above500', label: '₹500+' }
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setPriceFilter(b.id as any)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                priceFilter === b.id
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Sort & Stock Options */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-0.5 sm:pt-0">
          {/* In-Stock Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 select-none shrink-0">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                inStockOnly ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300 bg-white'
              }`}
            >
              {inStockOnly && <Check className="w-2.5 h-2.5" />}
            </div>
            <span className="text-[11px] font-medium">In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-stone-400 hidden xs:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 text-stone-700 text-[11px] font-medium rounded-md px-2 py-1 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Item Counter & Reset Active Filter Button */}
      <div className="w-full flex items-center justify-between text-xs text-stone-500 pt-0.5">
        <span>
          Showing <strong className="text-stone-900 font-semibold">{totalFilteredCount}</strong> items
          {selectedCategory !== 'All' && <span> in <strong className="text-stone-900 font-semibold">{selectedCategory}</strong></span>}
        </span>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium transition-colors cursor-pointer text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
