// Order domain types - simplified schema

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "failed";

export type ShippingMethod = "standard" | "express";

export type UserAddress = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  street: string;
  postalCode?: string;
  deliveryInstructions: string;
};

export type ProductSnapshot = {
  productId: string;
  brandId: string;
  name: string;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  user_id: string | null;
  product_snapshot: ProductSnapshot;
  selected_size: string;
  selected_color: string;
  quantity: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
  wire_transaction_id: string | null;
  status: OrderStatus;
  shipping_address: UserAddress;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateOrderInput = {
  userId?: string | null;
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  shippingMethod: "standard" | "express";
  shippingAddress: UserAddress;
};

export type PaymentAttempt = {
  id: string;
  order_id: string;
  wire_transaction_id: string | null;
  success: boolean;
  failure_reason: string | null;
  wire_response: Record<string, any> | null;
  created_at: string;
};

export type CreatePaymentResponse = {
  checkoutUrl: string;
  paymentIntentId: string;
  expiresAt: number;
};

export type PaymentStatusResponse = {
  status: OrderStatus;
  paymentIntentId: string;
  message?: string;
};
