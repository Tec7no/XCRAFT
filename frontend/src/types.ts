export type Category = 'Men' | 'Kids' | 'Women';

export type Badge = 'New' | 'Sale' | 'Limited' | null;

// Structured color option with hex and optional name
export interface ColorOption {
  hex: string;
  name?: string;
  image?: string; // URL or base64 of color-specific image
}

// Legacy: Stock by color (key is lowercase hex, value is quantity)
export type StockByColor = Record<string, number>;

// NEW: Variant stock matrix (Size × Color)
// Key format: "SIZE__#hexlower" e.g. "XL__#ff0000"
export type VariantKey = string;
export type VariantStock = Record<VariantKey, number>;

// Helper to safely extract size label from any format
const getSizeStr = (size: unknown): string => {
  if (typeof size === 'string') return size;
  if (size && typeof size === 'object' && 'label' in size) {
    return String((size as { label: unknown }).label);
  }
  return String(size ?? '');
};

// Helper to create a variant key (safe for legacy SizeOption objects)
export const makeVariantKey = (size: unknown, hex: string): VariantKey =>
  `${getSizeStr(size).toUpperCase()}__${hex.toLowerCase()}`;

// Helper to parse a variant key
export const parseVariantKey = (key: VariantKey): { size: string; hex: string } | null => {
  const parts = key.split('__');
  if (parts.length !== 2) return null;
  return { size: parts[0], hex: parts[1] };
};

export interface Product {
  id: string;
  name: string; // Keep as fallback/main display
  name_ar?: string;
  name_en?: string;
  code: string;
  category: Category;
  stock: number;
  salePrice: number;
  originalPrice: number;
  discount: number;
  description?: string; // Fallback
  description_ar?: string;
  description_en?: string;
  instructions?: string;
  colors: ColorOption[];
  sizes: string[];
  variantStock?: VariantStock;
  stockByColor?: StockByColor;
  images: string[];
  badge?: Badge;
  specifications?: ProductSpecificationSection[];
  sizeGuideImage?: string;
  featuredIn?: ('Best Sellers' | 'New Arrivals' | 'Offers')[];
}

export interface ProductSpecItem {
  label: string; // Fallback
  label_ar?: string;
  label_en?: string;
  value: string; // Fallback
  value_ar?: string;
  value_en?: string;
}

export interface ProductSpecificationSection {
  id: string;
  title: string; // Fallback
  title_ar?: string;
  title_en?: string;
  items: ProductSpecItem[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// ================== ORDER SYSTEM ==================

// Payment methods
export type PaymentMethod = 'card' | 'transfer' | 'cod';

// Order status workflow
export type OrderStatus =
  | 'pending_review'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'shipping'
  | 'delivered';

// Order item (flattened from CartItem for persistence)
export interface OrderItem {
  productId: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  code: string;
  image: string;
  size: string;
  color: string;
  colorName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Customer info
export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
}

// Payment info
export interface PaymentInfo {
  method: PaymentMethod;
  proofImage?: string; // base64 for MVP
  // For Card payments
  transactionId?: string;
  maskedCard?: string;
  cardBrand?: string;
}

// Full Order interface
export interface Order {
  id: string;
  items: OrderItem[];
  customer: CustomerInfo;
  payment: PaymentInfo;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

// ================== USER SYSTEM ==================

export type UserRole = 'customer' | 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses?: Address[];
}

export interface Address {
  id: string;
  name: string; // "Home", "Work"
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  minOrderAmount?: number;
  usageCount: number;
}

