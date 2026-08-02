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
  thumb: string;
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
// Payment Types (Wire Integration)
// ============================================

export type PaymentStatus = 
  | "pending_payment"
  | "processing"
  | "paid"
  | "cancelled"
  | "failed";

export type OrderStatus = 
  | "pending_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type WirePaymentIntent = {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  description: string;
  status: "new" | "processing" | "succeeded" | "canceled" | "failed";
  client_secret: string;
  automatic_operator: boolean;
  allowed_operators: string[];
  selected_operator: string | null;
  next_action: WireNextAction | null;
  metadata: Record<string, string>;
  livemode: boolean;
  created: number;
  expires_at: number;
};

export type WireNextAction = {
  type: string;
  redirect?: {
    url: string;
  };
};

export type WireCheckoutSession = {
  id: string;
  object: "checkout_session";
  payment_intent: string;
  url: string;
  status: "open" | "complete" | "expired";
  created: number;
  expires_at: number;
};

export type WireWebhookEvent = {
  id: string;
  object: "event";
  type: "payment_intent.succeeded" | "payment_intent.failed" | "payment_intent.canceled";
  created: number;
  data: {
    object: WirePaymentIntent;
  };
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
    };
  };
};
