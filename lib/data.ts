/**
 * Kream Outlet – Data Service (Deprecated)
 * =========================================
 * This file is deprecated. Use the new service layer instead:
 *   - services/products.ts
 *   - services/orders.ts
 *   - services/payment.ts
 *
 * This file re-exports from the new services for backward compatibility.
 */

export {
  fetchProducts,
  fetchProductById,
  searchProducts,
  fetchReviews,
} from "@/services/products";
export {
  createOrder,
  updateOrder,
  cancelOrder,
  fetchUserOrders,
  fetchOrderById,
  updateShipping,
} from "@/services/orders";
export {
  createPaymentSession,
  getPaymentStatus,
  cancelPayment,
  retryPayment,
} from "@/services/payment";
export type { PaymentResult } from "@/types";
