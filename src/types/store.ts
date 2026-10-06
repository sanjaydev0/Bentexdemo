export type Category = 
  | 'All'
  | 'Chains'
  | 'Lockets & Pendants'
  | 'Bangles'
  | 'Earrings'
  | 'Necklace Sets'
  | 'Mangalsutra'
  | 'Anklets'
  | 'Rings & Waistbelts';

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: Category;
  price: number;
  mrp: number;
  costPrice: number; // Wholesale cost for merchant profit calculations
  image: string;
  variants: string[]; // e.g. ["2.4", "2.6", "2.8"] or ["18 inch", "24 inch"]
  badge?: 'Bestseller' | 'Trending' | 'Festive Special' | 'New Arrival' | '1-Gram Polish';
  inStock: boolean;
  stockQty: number;
  description: string;
  polishType: '1-Gram Micro Gold' | 'Matte Antique' | 'Bentex Brass' | 'CZ Diamond' | 'Temple Polish';
  warrantyMonths: number;
  tags: string[];
}

export interface CartItem {
  product: Product;
  selectedVariant?: string;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  doorNumber: string;
  street: string;
  landmark: string;
  townPincode: string;
  paymentMode: 'COD' | 'UPI on Delivery';
}

export type OrderStatus = 'New' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  notes?: string;
}

export interface StoreConfig {
  name: string;
  tagline: string;
  phone: string; // 12 digit without +: 919876543210
  displayPhone: string;
  townAddress: string;
  pincode: string;
  upiId: string;
  currency: string;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  enableCOD: boolean;
  announcementText: string;
  gstNumber?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  active: boolean;
}

export interface CustomerRecord {
  phone: string;
  name: string;
  doorNumber: string;
  street: string;
  townPincode: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}
