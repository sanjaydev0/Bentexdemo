import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category, Product } from '../../types/store';
import { X, Upload, Layers, Check, Sparkles, Trash2, Plus, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { compressImageFile } from '../../utils/imageUtils';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface DraftItem {
  id: string;
  title: string;
  category: Category;
  price: number;
  mrp: number;
  costPrice: number;
  image: string;
  stockQty: number;
  polishType: Product['polishType'];
  variants: string[];
}

const CATEGORIES: Category[] = [
  'Chains',
  'Lockets & Pendants',
  'Bangles',
  'Earrings',
  'Necklace Sets',
  'Mangalsutra',
  'Anklets',
  'Rings & Waistbelts'
];

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { bulkAddProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'photos' | 'paste' | 'presets'>('photos');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<Category>('Lockets & Pendants');
  const [defaultPrice, setDefaultPrice] = useState<number>(299);
  const [defaultMrp, setDefaultMrp] = useState<number>(599);
  const [defaultStock, setDefaultStock] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvText, setCsvText] = useState('');

  if (!isOpen) return null;

  // Handle local device multiple files upload with offscreen canvas compression
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newDrafts: DraftItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedDataUrl = await compressImageFile(file, 800, 0.8);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        newDrafts.push({
          id: `draft_${Date.now()}_${i}`,
          title: formattedTitle || `1-Gram Gold ${defaultCategory} Item ${i + 1}`,
          category: defaultCategory,
          price: defaultPrice,
          mrp: defaultMrp,
          costPrice: Math.round(defaultPrice * 0.45),
          image: compressedDataUrl,
          stockQty: defaultStock,
          polishType: '1-Gram Micro Gold',
          variants: defaultCategory === 'Bangles' ? ['2.4', '2.6', '2.8'] : ['Standard']
        });
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    setDraftItems((prev) => [...prev, ...newDrafts]);
    setIsProcessing(false);
    // Reset file input value
    e.target.value = '';
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    const parsed: DraftItem[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map((s) => s.trim());
      if (parts.length >= 2) {
        const title = parts[0];
        const categoryInput = parts[1] as Category;
        const category = CATEGORIES.includes(categoryInput) ? categoryInput : defaultCategory;
        const price = Number(parts[2]) || defaultPrice;
        const mrp = Number(parts[3]) || Math.round(price * 2);
        const stock = Number(parts[4]) || defaultStock;
        const imageUrl = parts[5] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80';

        parsed.push({
          id: `csv_${Date.now()}_${idx}`,
          title,
          category,
          price,
          mrp,
          costPrice: Math.round(price * 0.45),
          image: imageUrl,
          stockQty: stock,
          polishType: '1-Gram Micro Gold',
          variants: category === 'Bangles' ? ['2.4', '2.6', '2.8'] : ['Standard']
        });
      }
    });

    if (parsed.length > 0) {
      setDraftItems((prev) => [...prev, ...parsed]);
      setCsvText('');
    }
  };

  const handleRemoveDraft = (id: string) => {
    setDraftItems((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDraft = (id: string, field: keyof DraftItem, val: any) => {
    setDraftItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d))
    );
  };

  // Preset Template Loader for instant demo imports
  const handleLoadPresetBatch = (type: 'lockets' | 'bangles' | 'sets' | 'chains') => {
    const timestamp = Date.now();
    let batch: DraftItem[] = [];

    if (type === 'lockets') {
      batch = [
        {
          id: `b_${timestamp}_1`,
          title: 'Royal Lakshmi Matte Coin Locket with Emerald Drops',
          category: 'Lockets & Pendants',
          price: 219,
          mrp: 449,
          costPrice: 90,
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
          stockQty: 25,
          polishType: 'Temple Polish',
          variants: ['Standard']
        },
        {
          id: `b_${timestamp}_2`,
          title: 'Carved Peacock Ruby Enamel Big Locket',
          category: 'Lockets & Pendants',
          price: 269,
          mrp: 549,
          costPrice: 110,
          image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&auto=format&fit=crop&q=80',
          stockQty: 18,
          polishType: '1-Gram Micro Gold',
          variants: ['Ruby Center', 'Emerald Center']
        },
        {
          id: `b_${timestamp}_3`,
          title: 'Lord Venkateswara Balaji Auspicious Locket',
          category: 'Lockets & Pendants',
          price: 199,
          mrp: 399,
          costPrice: 80,
          image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80',
          stockQty: 30,
          polishType: '1-Gram Micro Gold',
          variants: ['Standard']
        }
      ];
    } else if (type === 'bangles') {
      batch = [
        {
          id: `b_${timestamp}_4`,
          title: 'Micro Polish Daily Cut-Work Bangles (Set of 2)',
          category: 'Bangles',
          price: 299,
          mrp: 599,
          costPrice: 130,
          image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80',
          stockQty: 20,
          polishType: '1-Gram Micro Gold',
          variants: ['2.4', '2.6', '2.8']
        },
        {
          id: `b_${timestamp}_5`,
          title: 'Bridal Floral Kemp Kada with Side Screw Opening',
          category: 'Bangles',
          price: 449,
          mrp: 899,
          costPrice: 190,
          image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=800&auto=format&fit=crop&q=80',
          stockQty: 12,
          polishType: 'Matte Antique',
          variants: ['2.4', '2.6', '2.8']
        }
      ];
    } else if (type === 'chains') {
      batch = [
        {
          id: `b_${timestamp}_7`,
          title: '1-Gram Gold Broad Box Pattern Groom & Daily Chain',
          category: 'Chains',
          price: 389,
          mrp: 799,
          costPrice: 170,
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
          stockQty: 15,
          polishType: '1-Gram Micro Gold',
          variants: ['22 inch', '24 inch']
        },
        {
          id: `b_${timestamp}_8`,
          title: 'Bentex Multi-Strand Wheat Pattern High-Lustre Chain',
          category: 'Chains',
          price: 319,
          mrp: 649,
          costPrice: 140,
          image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
          stockQty: 18,
          polishType: 'Bentex Brass',
          variants: ['20 inch', '24 inch']
        }
      ];
    } else {
      batch = [
        {
          id: `b_${timestamp}_6`,
          title: 'Matte Antique Lakshmi Kasu Choker Necklace Set',
          category: 'Necklace Sets',
          price: 749,
          mrp: 1499,
          costPrice: 320,
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
          stockQty: 10,
          polishType: 'Temple Polish',
          variants: ['With Earrings']
        }
      ];
    }

    setDraftItems((prev) => [...prev, ...batch]);
  };

  const handleConfirmBulkSave = () => {
    if (draftItems.length === 0) return;

    const toImport: Omit<Product, 'id'>[] = draftItems.map((item, idx) => ({
      title: item.title,
      sku: `BLK-${Math.floor(1000 + Math.random() * 9000)}-${idx + 1}`,
      category: item.category,
      price: item.price,
      mrp: item.mrp,
      costPrice: item.costPrice,
      image: item.image,
      variants: item.variants,
      badge: 'New Arrival',
      inStock: item.stockQty > 0,
      stockQty: item.stockQty,
      description: `Handcrafted 1-Gram gold plated ${item.category} item with anti-tarnish micro lacquer.`,
      polishType: item.polishType,
      warrantyMonths: 6,
      tags: [item.category.toLowerCase(), 'jewellery', 'gold']
    }));

    bulkAddProducts(toImport);
    onSuccess(toImport.length);
    setDraftItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-stone-200 flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Bulk Product Upload</h3>
                <p className="text-xs text-stone-500">
                  Upload multiple photos from your local device, paste spreadsheet rows, or load demo batches.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 my-4">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Photos from Computer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Paste Spreadsheet / CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Templates</span>
            </button>
          </div>

          {/* Tab 1: Local Device Photos Multi-Upload */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Default Settings for the batch */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Batch Category</label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value as Category)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">MRP Struck (₹)</label>
                  <input
                    type="number"
                    value={defaultMrp}
                    onChange={(e) => setDefaultMrp(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stock Qty / Item</label>
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Upload Drop Zone */}
              <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center space-y-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesSelected}
                  className="hidden"
                  disabled={isProcessing}
                />
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 text-sm">
                    {isProcessing ? 'Compressing and preparing photos...' : 'Click to select multiple jewellery photos'}
                  </span>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select JPEG, PNG, or WebP files from your phone or computer. Photos are automatically compressed for high-speed offline loading.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Tab 2: Spreadsheet / CSV Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600">
                <span className="font-bold text-stone-800 block mb-1">Format (1 item per line):</span>
                <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-stone-200 block text-stone-700">
                  Product Title, Category, SellingPrice, MRP, Stock, [Image URL optional]
                </code>
                <p className="text-[11px] text-stone-500 mt-1">
                  Example: <code>1-Gram Gold Daily Rope Chain, Chains, 349, 699, 15</code>
                </p>
              </div>

              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="1-Gram Gold Daily Rope Chain, Chains, 349, 699, 15&#10;Lakshmi Coin Locket, Lockets & Pendants, 199, 399, 25"
                className="w-full p-3 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:border-stone-500"
              />

              <button
                type="button"
                onClick={handleParseCsv}
                disabled={!csvText.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Add Rows to Draft List
              </button>
            </div>
          )}

          {/* Tab 3: 1-Click Templates */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                Instantly import pre-curated 1-Gram gold and bentex catalog collections:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleLoadPresetBatch('lockets')}
                  className="p-3 text-left bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer group"
                >
                  <strong className="text-stone-900 text-xs block group-hover:text-amber-900">
                    + Temple Lockets &amp; Pendants (3 items)
                  </strong>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Lakshmi Coin Locket, Peacock Ruby Pendant, Balaji Pendant
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadPresetBatch('bangles')}
                  className="p-3 text-left bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer group"
                >
                  <strong className="text-stone-900 text-xs block group-hover:text-amber-900">
                    + Bentex &amp; Antique Bangles (2 items)
                  </strong>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Cut-Work Daily Bangles, Bridal Screw-Lock Kada
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadPresetBatch('chains')}
                  className="p-3 text-left bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer group"
                >
                  <strong className="text-stone-900 text-xs block group-hover:text-amber-900">
                    + 1-Gram Gold Chains (2 items)
                  </strong>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Box Pattern Daily Chain, Multi-Strand Wheat Pattern Chain
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadPresetBatch('sets')}
                  className="p-3 text-left bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer group"
                >
                  <strong className="text-stone-900 text-xs block group-hover:text-amber-900">
                    + Bridal Choker &amp; Haram Set (1 item)
                  </strong>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Matte Antique Lakshmi Kasu Choker Necklace with Jhumkas
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Draft Items Preview Table */}
          {draftItems.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">
                  Ready to Import ({draftItems.length} items):
                </span>
                <button
                  type="button"
                  onClick={() => setDraftItems([])}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All Drafts
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {draftItems.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  >
                    <img
                      src={draft.image}
                      alt={draft.title}
                      className="w-10 h-12 object-cover rounded bg-stone-200 shrink-0 border border-stone-300"
                    />
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => handleUpdateDraft(draft.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-stone-300 rounded font-medium text-stone-900 text-xs"
                          placeholder="Title"
                        />
                      </div>
                      <div>
                        <select
                          value={draft.category}
                          onChange={(e) => handleUpdateDraft(draft.id, 'category', e.target.value as Category)}
                          className="w-full px-1.5 py-1 bg-white border border-stone-300 rounded text-[11px]"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500 font-mono text-[11px]">₹</span>
                        <input
                          type="number"
                          value={draft.price}
                          onChange={(e) => handleUpdateDraft(draft.id, 'price', Number(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 bg-white border border-stone-300 rounded font-mono text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraft(draft.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmBulkSave}
            disabled={draftItems.length === 0}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Import {draftItems.length} Items to Inventory</span>
          </button>
        </div>

      </div>
    </div>
  );
};
