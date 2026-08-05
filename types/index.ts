import { Colors } from "@/constants/theme";
import { translationValues } from "@/constants/translations";
import type { TextProps, ViewProps } from "react-native";

// Database Types
export type TableRow<T> = {
  Row: T;
  Insert: T;
  Update: Partial<T>;
  Relationships: never[];
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
};

export type Product = {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  price: number;
  thumb: string | null;
  available_colors: string[] | null;
  available_sizes: number[] | null;
  cargo_fee: number;
  shipment_days: number;
  sex: "male" | "female" | "unisex";
  category: string | null;
  location: string;
  is_available: boolean;
  created_at: string;
  user_id: string | null;
};

export type ProductWithDetails = Product & {
  brandName: string;
  avgRating: number;
  reviewCount: number;
};

export type Review = {
  id: string;
  user_id: string;
  sneaker_id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
};

// ============================================
// Payment Types
// ============================================

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired";

export type OrderStatus =
  | "pending_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentProvider = "wire" | "stripe" | "paypal";

export type PaymentMethod = {
  id: string;
  name: string;
  type: "card" | "qpay" | "socialpay" | "bank_transfer";
  icon?: string;
  enabled: boolean;
};

// ============================================
// Order Types
// ============================================

export type AddressData = {
  recipientName: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  district: string;
  streetAddress: string;
  postalCode: string;
  postal_code?: string;
  deliveryInstructions: string;
};

export type ShippingSnapshot = {
  method: "standard" | "express";
  fee: number;
  estimatedDays: string;
};

export type ProductSnapshot = {
  productId: string;
  brandId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  user_id: string | null;
  // Product snapshot
  product_snapshot: ProductSnapshot;
  // Shipping snapshot
  shipping_snapshot: ShippingSnapshot;
  // Pricing
  subtotal: number;
  platform_fee: number;
  shipping_fee: number;
  total_amount: number;
  // Status
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  // Payment info
  payment_method: string | null;
  payment_provider: "wire" | null;
  wire_payment_intent_id: string | null;
  wire_checkout_url: string | null;
  // Metadata
  shipping_address: AddressData;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  sneaker_id: string;
  quantity: number;
  price: number;
  created_at?: string | null;
};

// ============================================
// Payment Request/Response Types
// ============================================

export type CreatePaymentRequest = {
  orderId: string;
  operatorIds?: string[];
  returnUrl?: string;
  cancelUrl?: string;
};

export type CreatePaymentResponse = {
  checkoutUrl: string;
  paymentIntentId: string;
  expiresAt: number;
};

export type PaymentStatusResponse = {
  status: PaymentStatus;
  paymentIntentId: string;
  message?: string;
};

export type WirePaymentSession = {
  checkout_url: string;
  payment_id: string;
  expires_at: string;
};

export type CreateOrderInput = {
  user_id?: string | null;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  selected_size: string;
  selected_color: string;
  quantity: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal: string;
  payment_provider: PaymentProvider;
  payment_method: string;
  coupon_id?: string | null;
  coupon_discount?: number;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product | null })[];
};

export type PaymentResult = {
  success: boolean;
  orderId: string;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
};

// ============================================
// UI Component Types
// ============================================

export type SneakerCardProps = {
  sneaker: Product;
  onPress: () => void;
  compact?: boolean;
};

export type StarRatingProps = {
  rating: number;
  size?: number;
  showCount?: boolean;
  reviewCount?: number;
};

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export type IconSymbolName =
  | "house.fill"
  | "magnifyingglass"
  | "bag.fill"
  | "person.fill"
  | "paperplane.fill"
  | "chevron.left.forwardslash.chevron.right"
  | "chevron.right"
  | "heart"
  | "heart.fill";

export type TranslationKey = keyof typeof translationValues;
export type ColorName = keyof typeof Colors.light;

export type UserProfile = {
  id: string;
  email?: string;
  address?: AddressData;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// Database Type Definitions
// ============================================

export type Database = {
  public: {
    Tables: {
      brands: TableRow<Brand>;
      products: TableRow<Product>;
      reviews: TableRow<Review>;
      orders: TableRow<Order>;
      order_items: TableRow<OrderItem>;
      profiles: TableRow<UserProfile>;
      payments: TableRow<Payment>;
    };
  };
};

export type Payment = {
  id: string;
  order_id: string;
  user_id: string | null;
  wire_transaction_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};
