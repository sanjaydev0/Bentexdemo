import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, Order } from '../types/store';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Tag, Check, MessageCircle, Copy, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { UPIModal } from './UPIModal';
import { InvoiceModal } from './admin/InvoiceModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LS_CUSTOMER_KEY = 'swarna_customer_profile_v1';

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    config,
    cartSubtotal,
    deliveryFee,
    freeDeliveryRemaining,
    updateCartQty,
    removeFromCart,
    createOrder
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [waLink, setWaLink] = useState('');
  const [rawOrderText, setRawOrderText] = useState('');

  // Customer form details
  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    try {
      const saved = localStorage.getItem(LS_CUSTOMER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '',
      phone: '',
      doorNumber: '',
      street: '',
      landmark: '',
      townPincode: config.pincode,
      paymentMode: 'COD'
    };
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && checkoutStep === 'success' && !placedOrder) {
      setCheckoutStep('cart');
    }
  }, [isOpen, checkoutStep, placedOrder]);

  if (!isOpen) return null;

  // Coupon handling
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FESTIVAL10') {
      const disc = Math.round(cartSubtotal * 0.1);
      setCouponDiscount(disc);
      setCouponMessage('🎉 Coupon applied: 10% Festive Discount!');
    } else if (code === 'TOWN50' && cartSubtotal >= 399) {
      setCouponDiscount(50);
      setCouponMessage('🎉 Coupon applied: ₹50 Local Shopper Discount!');
    } else if (code === 'TOWN50') {
      setCouponMessage('⚠️ Code TOWN50 requires minimum order of ₹399.');
      setCouponDiscount(0);
    } else {
      setCouponMessage('❌ Invalid coupon code. Try FESTIVAL10 or TOWN50.');
      setCouponDiscount(0);
    }
  };

  const finalTotal = Math.max(0, cartSubtotal + deliveryFee - couponDiscount);

  // Validate form
  const validateCustomerForm = () => {
    const errors: Record<string, string> = {};
    if (!customer.name.trim()) errors.name = 'Please enter your full name';
    if (!customer.phone.trim() || !/^\d{10}$/.test(customer.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter valid 10-digit mobile number';
    }
    if (!customer.doorNumber.trim()) errors.doorNumber = 'Door/House No. required';
    if (!customer.street.trim()) errors.street = 'Street or area required';
    if (!customer.townPincode.trim()) errors.townPincode = 'Pincode required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit to WhatsApp & Record in Admin
  const handleProceedToWhatsApp = () => {
    if (!validateCustomerForm()) return;

    // Persist customer profile
    try {
      localStorage.setItem(LS_CUSTOMER_KEY, JSON.stringify(customer));
    } catch {}

    // Build formatted message from current cart items before clearing
    let itemsText = '';
    cart.forEach((c, idx) => {
      const variantText = c.selectedVariant ? ` | Size/Type: ${c.selectedVariant}` : '';
      const lineTotal = c.product.price * c.quantity;
      itemsText += `${idx + 1}. *${c.product.title}*${variantText}\n   Qty: ${c.quantity} × ${config.currency}${c.product.price} = *${config.currency}${lineTotal}*\n`;
    });

    // Record order in local storage & admin pipeline
    const newOrder = createOrder(customer, couponDiscount, couponDiscount > 0 ? couponCode : undefined);
    setPlacedOrder(newOrder);

    const deliveryText = deliveryFee === 0 ? 'FREE (Town Offer)' : `${config.currency}${deliveryFee}`;
    const discountText = couponDiscount > 0 ? `\n• Discount: -${config.currency}${couponDiscount} (${couponCode})` : '';

    const message = `🛍️ *NEW ORDER - ${config.name.toUpperCase()}*
---------------------------------
*Order ID:* #${newOrder.id}
*Items Ordered:*
${itemsText}
---------------------------------
*Bill Details:*
• Item Subtotal: ${config.currency}${cartSubtotal}
• Delivery Charges: ${deliveryText}${discountText}
• *Total Payable: ${config.currency}${finalTotal}*
• Payment Preference: *${customer.paymentMode}*

---------------------------------
*Customer Details:*
• Name: ${customer.name}
• Phone: ${customer.phone}
• Address: Door ${customer.doorNumber}, ${customer.street}
• Landmark: ${customer.landmark || 'Near Main Road'}
• Town Pincode: ${customer.townPincode}

Please confirm availability and dispatch time!`;

    setRawOrderText(message);
    const link = `https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`;
    setWaLink(link);

    // Transition to success screen
    setCheckoutStep('success');

    // Trigger WhatsApp link via direct anchor or window
    try {
      window.open(link, '_blank');
    } catch (e) {
      console.warn('Popup blocked, direct link is provided on screen', e);
    }
  };

  const copyOrderText = () => {
    navigator.clipboard.writeText(rawOrderText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleFinishAndClose = () => {
    setPlacedOrder(null);
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
        <div
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                {checkoutStep === 'cart'
                  ? 'Your Shopping Bag'
                  : checkoutStep === 'details'
                  ? 'Delivery Address'
                  : 'Order Placed!'}
              </h2>
              {checkoutStep !== 'success' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items
                </span>
              )}
            </div>
            <button
              onClick={handleFinishAndClose}
              className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Free Delivery Bar (Shown on cart and details steps) */}
            {checkoutStep !== 'success' && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-2 mb-1.5 text-amber-950 font-semibold">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  {freeDeliveryRemaining > 0 ? (
                    <span>
                      Add <strong>{config.currency}{freeDeliveryRemaining}</strong> more for <strong>FREE Local Delivery</strong>!
                    </span>
                  ) : (
                    <span className="text-emerald-800 font-bold">
                      🎉 You have unlocked FREE Local Town Delivery!
                    </span>
                  )}
                </div>
                <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-emerald-600 h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (cartSubtotal / config.freeDeliveryThreshold) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cart Step: Line items */}
            {checkoutStep === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-3xl">
                      🛍️
                    </div>
                    <p className="font-medium text-stone-800">Your shopping bag is empty</p>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Explore our 1-gram gold chains, bentex bangles, and bridal temple sets to add items.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition-colors shadow-xs cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 divide-y divide-stone-100">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedVariant || 'default'}`}
                        className="pt-3 flex gap-3 items-center"
                      >
                        {/* Thumbnail */}
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-16 h-20 object-cover rounded-lg bg-stone-100 border border-stone-200 shrink-0"
                        />

                        {/* Title and details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {item.product.title}
                          </h4>
                          {item.selectedVariant && (
                            <span className="text-[11px] text-amber-800 font-medium block">
                              Size/Type: {item.selectedVariant}
                            </span>
                          )}
                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-sm font-bold font-serif text-stone-950">
                              {config.currency}{item.product.price}
                            </span>
                            <span className="text-[11px] text-stone-600 line-through">
                              {config.currency}{item.product.mrp}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                              <button
                                onClick={() =>
                                  updateCartQty(item.product.id, item.selectedVariant, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQty(item.product.id, item.selectedVariant, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.product.stockQty}
                                className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                              className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Coupon Code Section */}
                {cart.length > 0 && (
                  <div className="pt-2">
                    <label className="text-xs font-medium text-stone-700 flex items-center gap-1 mb-1">
                      <Tag className="w-3.5 h-3.5 text-amber-700" /> Apply Coupon Code:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Try FESTIVAL10 or TOWN50"
                        className="flex-1 px-3 py-1.5 text-xs uppercase font-mono tracking-wider border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-3 py-1.5 bg-stone-900 text-white hover:bg-amber-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p className="text-[11px] mt-1 text-stone-600 font-medium">
                        {couponMessage}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Details Step: Address form */}
            {checkoutStep === 'details' && (
              <div className="space-y-3">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-semibold">Local Town Dispatch Guarantee</p>
                  <p className="text-[11px] mt-0.5 text-amber-950">
                    We pack and dispatch directly from our local town shop with our personal delivery boy or counter pickup.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-stone-800 block mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. Lakshmi Prasanna"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                      {formErrors.name}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-medium text-stone-800 block mb-1">
                    10-Digit Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 9848012345"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
                  />
                  {formErrors.phone && (
                    <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                      {formErrors.phone}
                    </span>
                  )}
                </div>

                {/* Door & Street */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-stone-800 block mb-1">
                      Door / House No. *
                    </label>
                    <input
                      type="text"
                      value={customer.doorNumber}
                      onChange={(e) => setCustomer({ ...customer, doorNumber: e.target.value })}
                      placeholder="e.g. 4-12/A"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                    {formErrors.doorNumber && (
                      <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                        {formErrors.doorNumber}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-800 block mb-1">
                      Street / Area *
                    </label>
                    <input
                      type="text"
                      value={customer.street}
                      onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
                      placeholder="e.g. Temple Street"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                    {formErrors.street && (
                      <span className="text-[10px] text-rose-600 font-medium block mt-0.5">
                        {formErrors.street}
                      </span>
                    )}
                  </div>
                </div>

                {/* Landmark & Pincode */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-stone-800 block mb-1">
                      Landmark / Town Area
                    </label>
                    <input
                      type="text"
                      value={customer.landmark}
                      onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                      placeholder="e.g. Opp. Clock Tower"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-800 block mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={customer.townPincode}
                      onChange={(e) => setCustomer({ ...customer, townPincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 522201"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono"
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div>
                  <label className="text-xs font-medium text-stone-800 block mb-1.5">
                    Payment Preference:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        customer.paymentMode === 'COD'
                          ? 'bg-amber-50 border-amber-600 text-amber-950 font-semibold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={customer.paymentMode === 'COD'}
                        onChange={() => setCustomer({ ...customer, paymentMode: 'COD' })}
                        className="sr-only"
                      />
                      <span className="text-xs">💵 Cash on Delivery</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        customer.paymentMode === 'UPI on Delivery'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                          : 'bg-white border-stone-200 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={customer.paymentMode === 'UPI on Delivery'}
                        onChange={() => setCustomer({ ...customer, paymentMode: 'UPI on Delivery' })}
                        className="sr-only"
                      />
                      <span className="text-xs">📱 UPI / QR Code</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Success Step: Order Placed Confirmation */}
            {checkoutStep === 'success' && placedOrder && (
              <div className="py-4 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    Order Submitted Successfully!
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Order Reference: <strong className="font-mono text-stone-900">#{placedOrder.id}</strong>
                  </p>
                </div>

                {/* WhatsApp Dispatch Button */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span>WhatsApp Order Dispatch</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Tap the green button below to send your structured order to our shop’s WhatsApp:
                  </p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat (+{config.phone})</span>
                  </a>

                  <button
                    onClick={copyOrderText}
                    className="w-full py-1.5 bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Order Text Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Order Message Text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* UPI QR trigger if UPI selected */}
                {placedOrder.customer.paymentMode === 'UPI on Delivery' && (
                  <button
                    onClick={() => setShowUpiModal(true)}
                    className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Scan UPI QR Code ({config.currency}{placedOrder.total})</span>
                  </button>
                )}

                {/* View Invoice button */}
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>View Print-Ready Tax / Cash Bill</span>
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={handleFinishAndClose}
                  className="text-xs font-semibold text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer pt-2"
                >
                  <span>Continue Browsing Jewellery Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Footer & Order Summary (Hidden when on success step) */}
          {cart.length > 0 && checkoutStep !== 'success' && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              {/* Cost Summary Breakdown */}
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{config.currency}{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `${config.currency}${deliveryFee}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{config.currency}{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="font-serif text-base text-amber-900">
                    {config.currency}{finalTotal}
                  </span>
                </div>
              </div>

              {/* Main CTA */}
              {checkoutStep === 'cart' ? (
                <button
                  onClick={() => setCheckoutStep('details')}
                  className="w-full py-3 bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Proceed to Delivery Details</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="px-3 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProceedToWhatsApp}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Order to WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* UPI QR Payment Modal */}
      {placedOrder && (
        <UPIModal
          isOpen={showUpiModal}
          onClose={() => setShowUpiModal(false)}
          config={config}
          amount={placedOrder.total}
          orderId={placedOrder.id}
        />
      )}

      {/* Invoice Modal from Placed Order */}
      {placedOrder && (
        <InvoiceModal
          order={placedOrder}
          config={config}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
};
