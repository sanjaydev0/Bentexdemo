import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Category } from '../../types/store';
import { Plus, Search, Edit3, Trash2, Check, AlertTriangle, Image as ImageIcon, X, Layers, Upload, Download, ArrowUpDown, Filter } from 'lucide-react';
import { BulkUploadModal } from './BulkUploadModal';
import { compressImageFile } from '../../utils/imageUtils';

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

const PRESET_IMAGES = [
  { label: 'Gold Chain', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Locket / Pendant', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bangles', url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80' },
  { label: 'Earrings / Jhumka', url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80' },
  { label: 'Necklace Set', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mangalsutra', url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&auto=format&fit=crop&q=80' },
  { label: 'Payal / Anklets', url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80' },
  { label: 'Waistbelt / Ring', url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80' }
];

export const InventoryManager: React.FC = () => {
  const { products, config, addProduct, updateProduct, deleteProduct, adjustStock, replaceProducts } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompressingImg, setIsCompressingImg] = useState(false);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    title: '',
    sku: `JEW-${Math.floor(100 + Math.random() * 900)}`,
    category: 'Chains',
    price: 299,
    mrp: 599,
    costPrice: 130,
    image: PRESET_IMAGES[0].url,
    variants: ['18 inch', '22 inch'],
    badge: 'New Arrival',
    inStock: true,
    stockQty: 15,
    description: '1-Gram micro gold polished piece crafted with anti-tarnish coating.',
    polishType: '1-Gram Micro Gold',
    warrantyMonths: 6,
    tags: ['jewellery', 'gold']
  });

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [variantInput, setVariantInput] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStartEditPrice = (p: Product) => {
    setEditingPriceId(p.id);
    setTempPrice(p.price);
  };

  const handleSavePrice = (p: Product) => {
    if (tempPrice > 0) {
      updateProduct({ ...p, price: tempPrice });
      showToast(`Price updated to ${config.currency}${tempPrice} for ${p.title}`);
    }
    setEditingPriceId(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !showLowStockOnly || p.stockQty <= 5;
    return matchesCat && matchesSearch && matchesLowStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      sku: `JEW-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Chains',
      price: 299,
      mrp: 599,
      costPrice: 130,
      image: PRESET_IMAGES[0].url,
      variants: ['Standard'],
      badge: 'New Arrival',
      inStock: true,
      stockQty: 15,
      description: '1-Gram micro gold plated piece with durable polish guarantee.',
      polishType: '1-Gram Micro Gold',
      warrantyMonths: 6,
      tags: ['jewellery', 'gold']
    });
    setVariantInput('');
    setIsAddingNew(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      sku: p.sku,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      costPrice: p.costPrice || Math.round(p.price * 0.45),
      image: p.image,
      variants: p.variants,
      badge: p.badge,
      inStock: p.inStock,
      stockQty: p.stockQty,
      description: p.description,
      polishType: p.polishType,
      warrantyMonths: p.warrantyMonths,
      tags: p.tags
    });
    setVariantInput(p.variants.join(', '));
  };

  // Local File Upload with offscreen canvas compression
  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImg(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 0.8);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
      showToast('Photo uploaded from device!');
    } catch (err) {
      console.error(err);
      showToast('Could not load image file. Please try another image.');
    } finally {
      setIsCompressingImg(false);
      e.target.value = '';
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVariants = variantInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      mrp: Number(formData.mrp) || 0,
      costPrice: Number(formData.costPrice) || 0,
      stockQty: Number(formData.stockQty) || 0,
      variants: parsedVariants.length > 0 ? parsedVariants : formData.variants,
      inStock: Number(formData.stockQty) > 0
    };

    if (editingProduct) {
      updateProduct({
        ...payload,
        id: editingProduct.id
      });
      showToast(`Updated "${formData.title}" successfully!`);
      setEditingProduct(null);
    } else {
      addProduct(payload);
      showToast(`Added "${formData.title}" to inventory!`);
      setIsAddingNew(false);
    }
  };

  // Export full catalog as JSON
  const handleExportCatalog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swarna_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Catalog exported to JSON file!');
  };

  // Import catalog from JSON
  const handleImportCatalog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          replaceProducts(imported);
          showToast(`Successfully imported ${imported.length} products!`);
        }
      } catch (err) {
        console.error(err);
        showToast('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-stone-900 text-stone-100 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-stone-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search, Category Filter & Low Stock toggle */}
        <div className="flex flex-1 flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product title or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as Category)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
              showLowStockOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </button>
        </div>

        {/* Action Buttons: Add, Bulk Upload, Export */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
            title="Bulk upload multiple photos or import spreadsheet"
          >
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>Bulk Upload</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Product</span>
          </button>

          <button
            onClick={handleExportCatalog}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Export catalog as JSON backup"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Category &amp; Polish</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-center">Stock Count</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-500">
                    No products matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const profitMargin = p.price - (p.costPrice || 0);
                  const isLowStock = p.stockQty <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Item */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-10 h-12 object-cover rounded bg-stone-100 border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-stone-900 truncate">{p.title}</p>
                            <p className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Polish */}
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-stone-800 block">{p.category}</span>
                        <span className="text-[10px] text-amber-800">{p.polishType}</span>
                      </td>

                      {/* Selling Price & MRP */}
                      <td className="py-2.5 px-3 text-right">
                        {editingPriceId === p.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              autoFocus
                              value={tempPrice}
                              onChange={(e) => setTempPrice(Number(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSavePrice(p);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              className="w-16 px-1.5 py-0.5 text-xs border border-amber-500 rounded bg-white font-serif font-bold text-right"
                            />
                            <button
                              onClick={() => handleSavePrice(p)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save Price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditPrice(p)}
                            className="cursor-pointer group/price"
                            title="Click to edit price"
                          >
                            <span className="font-bold text-stone-950 font-serif block group-hover/price:text-amber-800 transition-colors">
                              {config.currency}{p.price} ✎
                            </span>
                            <span className="text-[10px] text-stone-500 line-through">
                              MRP {config.currency}{p.mrp}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cost & Margin */}
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-stone-600 font-serif block">
                          {config.currency}{p.costPrice || 0}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          +₹{profitMargin} margin
                        </span>
                      </td>

                      {/* Stock Count with Quick Adjust */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            className="w-5 h-5 rounded hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 cursor-pointer"
                          >
                            -
                          </button>
                          <span
                            className={`w-8 font-bold font-mono text-center ${
                              isLowStock ? 'text-rose-600' : 'text-stone-900'
                            }`}
                          >
                            {p.stockQty}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-5 h-5 rounded hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {isLowStock && (
                          <span className="block text-[9px] font-bold text-rose-600 uppercase mt-0.5">
                            Low Stock
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            updateProduct({
                              ...p,
                              inStock: !p.inStock,
                              stockQty: !p.inStock && p.stockQty === 0 ? 10 : p.stockQty
                            });
                            showToast(`Updated status for ${p.title}`);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                            p.inStock && p.stockQty > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {p.inStock && p.stockQty > 0 ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 rounded text-stone-600 hover:text-amber-800 hover:bg-stone-100 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-stone-200">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingProduct(null);
              }}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
              {editingProduct ? 'Edit Jewellery Product' : 'Add New Jewellery Item'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-3.5 mt-3 text-xs">
              {/* Title & SKU */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-stone-800 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 1-Gram Gold Daily Rope Chain"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              {/* Category & Polish Type */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Polish Type</label>
                  <select
                    value={formData.polishType}
                    onChange={(e) => setFormData({ ...formData, polishType: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-500"
                  >
                    <option value="1-Gram Micro Gold">1-Gram Micro Gold</option>
                    <option value="Matte Antique">Matte Antique</option>
                    <option value="Bentex Brass">Bentex Brass</option>
                    <option value="CZ Diamond">CZ Diamond</option>
                    <option value="Temple Polish">Temple Polish</option>
                  </select>
                </div>
              </div>

              {/* Price, MRP, Cost Price */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">MRP Struck (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Wholesale Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Stock Qty & Warranty */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Polish Guarantee (Months)</label>
                  <input
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Variants input */}
              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Sizes / Variants (comma separated, e.g. 2.4, 2.6, 2.8 or 18 inch, 24 inch)
                </label>
                <input
                  type="text"
                  value={variantInput}
                  onChange={(e) => setVariantInput(e.target.value)}
                  placeholder="2.4, 2.6, 2.8"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              {/* Product Image: Upload from Device or Enter URL */}
              <div className="space-y-2 border border-stone-200 p-3 rounded-xl bg-stone-50">
                <label className="font-bold text-stone-900 block text-xs">
                  Product Image (Local Device Upload or Web URL)
                </label>

                {/* Live Preview */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-18 bg-white rounded-lg border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* Device File Input */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-semibold cursor-pointer transition-colors text-xs">
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isCompressingImg ? 'Compressing photo...' : 'Choose Photo from Computer / Phone'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        className="hidden"
                        disabled={isCompressingImg}
                      />
                    </label>
                    <span className="block text-[11px] text-stone-500">
                      Supports JPEG, PNG, WebP. Compressed automatically for instant offline loading.
                    </span>
                  </div>
                </div>

                {/* URL input fallback */}
                <div className="pt-1.5">
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Or use Image URL:</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white"
                    placeholder="https://..."
                  />
                </div>

                {/* Preset quick pickers */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-stone-500 shrink-0">Presets:</span>
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: img.url })}
                      className="px-2 py-0.5 rounded text-[10px] bg-white hover:bg-amber-100 border border-stone-200 shrink-0 cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-stone-800 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                />
              </div>

              {/* Save Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className="px-3.5 py-1.5 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer active:scale-98"
                >
                  {editingProduct ? 'Save Product Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">Delete Product?</h4>
            <p className="text-xs text-stone-500">
              Are you sure you want to remove <strong>{productToDelete.title}</strong> ({productToDelete.sku}) from your inventory?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  showToast(`Removed "${productToDelete.title}"`);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={(count) => showToast(`Bulk imported ${count} items to inventory!`)}
      />
    </div>
  );
};
