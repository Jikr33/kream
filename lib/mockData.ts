/**
 * Kream Outlet – Mock Data
 * ========================
 * Realistic mock data for design preview and offline development.
 * The data service (lib/data.ts) automatically falls back to this
 * when Supabase is not configured or returns errors.
 */

import type { Order, OrderItem, Product, Review, AddressData } from "@/types";
import {
  BRANDS,
  getBrandName as getBrandNameFromRegistry,
} from "@/constants/brands";

export const mockBrands = BRANDS;

export const mockCategories: {
  id: string;
  name: string;
  thumb?: string | null;
}[] = [
  {
    id: "running",
    name: "Running",
    thumb: null,
  },
  {
    id: "basketball",
    name: "Basketball",
    thumb: null,
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    thumb: null,
  },
  {
    id: "training",
    name: "Training",
    thumb: null,
  },
  {
    id: "luxury",
    name: "Luxury",
    thumb: null,
  },
];

export const mockProducts: Product[] = [
  {
    id: "product-1",
    brand_id: "nike",
    name: "Air Force 1 Low",
    description:
      "The iconic Nike Air Force 1 Low in pristine white leather. Features a clean upper with perforated detailing and a comfortable Air cushioned midsole.",
    price: 120000,
    thumb:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
    available_colors: ["White", "Black", "Grey"],
    available_sizes: [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "unisex",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-01T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-2",
    brand_id: "adidas",
    name: "Ultraboost 22",
    description:
      "Adidas Ultraboost 22 with Boost midsole for responsive energy return. Features a Primeknit upper and Torsion System for stability.",
    price: 145000,
    thumb:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
    available_colors: ["Black", "White", "Grey"],
    available_sizes: [8, 8.5, 9, 9.5, 10, 11],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "running",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-05T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-3",
    brand_id: "new_balance",
    name: "New Balance 550",
    description:
      "New Balance 550 with classic suede and mesh upper. Features ENCAP midsole for cushioning and a durable outsole.",
    price: 85000,
    thumb:
      "https://images.unsplash.com/photo-1539185441755-76947ce34972?w=800&h=800&fit=crop",
    available_colors: ["White", "Grey"],
    available_sizes: [7, 8, 9, 10, 11, 12],
    cargo_fee: 3500,
    shipment_days: 10,
    sex: "unisex",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-10T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-4",
    brand_id: "jordan",
    name: "Air Jordan 1 Retro",
    description:
      "Air Jordan 1 Retro in the iconic 'Chicago' colorway. Premium leather upper with Nike Air cushioning in the heel.",
    price: 280000,
    thumb:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop",
    available_colors: ["Red", "Black", "White"],
    available_sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "basketball",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-15T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-5",
    brand_id: "puma",
    name: "RS-X Core",
    description:
      "Puma RS-X Core with bold retro design. Features a thick midsole with visible Torsion System and breathable mesh upper.",
    price: 95000,
    thumb:
      "https://images.unsplash.com/photo-1597044175934-8d4d6d4d6b5e?w=800&h=800&fit=crop",
    available_colors: ["Black", "White", "Grey"],
    available_sizes: [8, 9, 10, 11],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-20T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-6",
    brand_id: "vans",
    name: "Old Skool",
    description:
      "Vans Old Skool in classic black and white. Canvas upper with signature Waffle outsole for grip and durability.",
    price: 55000,
    thumb:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=800&fit=crop",
    available_colors: ["Black", "White"],
    available_sizes: [7, 8, 9, 10, 11, 12],
    cargo_fee: 3500,
    shipment_days: 10,
    sex: "unisex",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-25T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-7",
    brand_id: "nike",
    name: "Air Max 90",
    description:
      "Nike Air Max 90 with visible Air unit in the midsole. Features a synthetic upper with mesh panels for breathability.",
    price: 110000,
    thumb:
      "https://images.unsplash.com/photo-1509107776819-8958f5a2ac6f?w=800&h=800&fit=crop",
    available_colors: ["Grey", "Black"],
    available_sizes: [8, 9, 10, 11],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "running",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-06-28T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-8",
    brand_id: "converse",
    name: "Chuck Taylor All Star",
    description:
      "Converse Chuck Taylor All Star high-top in classic canvas. Iconic design with rubber toe cap and vulcanized sole.",
    price: 45000,
    thumb:
      "https://images.unsplash.com/photo-1519559909489-57f5d5d3a6ec?w=800&h=800&fit=crop",
    available_colors: ["White", "Black", "Red"],
    available_sizes: [6, 7, 8, 9, 10, 11],
    cargo_fee: 3500,
    shipment_days: 10,
    sex: "unisex",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-01T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-9",
    brand_id: "puma",
    name: "RS-X Reinvention",
    description:
      "Puma RS-X Reinvention with bold retro aesthetic. Features chunky midsole, leather and mesh upper with reflective detailing.",
    price: 135000,
    thumb:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
    available_colors: ["White", "Black"],
    available_sizes: [8, 9, 10, 11],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "lifestyle",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-05T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-10",
    brand_id: "jordan",
    name: "Air Jordan 4 Retro",
    description:
      "Air Jordan 4 Retro in 'Military Black' colorway. Premium leather and mesh construction with iconic Air cushioning and visible Nike Air unit.",
    price: 450000,
    thumb:
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop",
    available_colors: ["Black", "Grey", "White"],
    available_sizes: [8, 9, 10, 11, 12],
    cargo_fee: 3500,
    shipment_days: 7,
    sex: "male",
    category: "basketball",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-08T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-11",
    brand_id: "balenciaga",
    name: "Triple S Sneaker",
    description:
      "Balenciaga Triple S in black and white. Features Triple S sole construction with leather, mesh and nubuck upper in a deconstructed aesthetic.",
    price: 1200000,
    thumb:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
    available_colors: ["Black", "White"],
    available_sizes: [40, 41, 42, 43, 44],
    cargo_fee: 5000,
    shipment_days: 10,
    sex: "unisex",
    category: "luxury",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-10T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-12",
    brand_id: "gucci",
    name: "Tennis 1977 Sneaker",
    description:
      "Gucci Tennis 1977 in white leather with embossed Web detail. Features GG embossed leather sole and classic low-top silhouette.",
    price: 980000,
    thumb:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop",
    available_colors: ["White", "Cream"],
    available_sizes: [38, 39, 40, 41, 42],
    cargo_fee: 5000,
    shipment_days: 10,
    sex: "female",
    category: "luxury",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-12T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-13",
    brand_id: "louis_vuitton",
    name: "LV Trainer Sneaker",
    description:
      "Louis Vuitton LV Trainer in monogram canvas and leather. embroidered Monogram flowers and Louis Vuitton signature on the side.",
    price: 1650000,
    thumb:
      "https://images.unsplash.com/photo-1606171656699-ffea0f3ab2e4?w=800&h=800&fit=crop",
    available_colors: ["White", "Black"],
    available_sizes: [39, 40, 41, 42, 43],
    cargo_fee: 5000,
    shipment_days: 12,
    sex: "unisex",
    category: "luxury",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-14T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-14",
    brand_id: "dior",
    name: "B23 High-Top Sneaker",
    description:
      "Dior B23 High-Top in Oblique canvas with technical mesh. Features Dior signature and CD diamond motif on the side and rubber sole.",
    price: 1450000,
    thumb:
      "https://images.unsplash.com/photo-1583241800698-e8ab018302a0?w=800&h=800&fit=crop",
    available_colors: ["Black", "White"],
    available_sizes: [38, 39, 40, 41, 42, 43],
    cargo_fee: 5000,
    shipment_days: 12,
    sex: "unisex",
    category: "luxury",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-15T10:00:00Z",
    user_id: null,
  },
  {
    id: "product-15",
    brand_id: "prada",
    name: "Prada America's Cup Sneaker",
    description:
      "Prada America's Cup sneaker in brushed leather with Prada Linea Rossa triangle logo. Features technical fabric lining and rubber sole.",
    price: 1100000,
    thumb:
      "https://images.unsplash.com/photo-1539184441678-9b8158f1e582?w=800&h=800&fit=crop",
    available_colors: ["White", "Grey"],
    available_sizes: [39, 40, 41, 42, 43],
    cargo_fee: 5000,
    shipment_days: 12,
    sex: "male",
    category: "luxury",
    location: "Ulaanbaatar",
    is_available: true,
    created_at: "2024-07-16T10:00:00Z",
    user_id: null,
  },
];

export const getCategoryName = (
  categoryId: string | null | undefined,
): string => {
  if (!categoryId) return "Uncategorized";
  const category = mockCategories.find(
    (c) => c.id === categoryId.toLowerCase(),
  );
  return category?.name ?? "Uncategorized";
};

export const mockReviews: Review[] = [
  {
    id: "review-1",
    user_id: "user-1",
    sneaker_id: "sneaker-1",
    rating: 5,
    comment: "Маш сайн каражсан! Төсөөлөлтэй үнэ.",
    created_at: "2024-06-10T14:30:00Z",
  },
  {
    id: "review-2",
    user_id: "user-2",
    sneaker_id: "sneaker-1",
    rating: 4,
    comment: "Сайн байна, хавтас нь том байвал дэмжиж өгтэй.",
    created_at: "2024-06-15T09:15:00Z",
  },
  {
    id: "review-3",
    user_id: "user-3",
    sneaker_id: "sneaker-2",
    rating: 5,
    comment: "Улам урьдчилан санал болгосон. Тухдам байдаг.",
    created_at: "2024-06-20T16:45:00Z",
  },
  {
    id: "review-4",
    user_id: "user-4",
    sneaker_id: "sneaker-4",
    rating: 5,
    comment: "AJ1-ийн алдарт цөөн үнээр. Рекоменд карилаа.",
    created_at: "2024-06-22T11:20:00Z",
  },
  {
    id: "review-5",
    user_id: "user-5",
    sneaker_id: "sneaker-3",
    rating: 3,
    comment: "Дунд зүйл байна. Үнэ нь немэлтгүй.",
    created_at: "2024-06-25T08:00:00Z",
  },
];

const address1: AddressData = {
  recipientName: "John Doe",
  phoneNumber: "+976 99123456",
  email: "john@example.com",
  country: "Mongolia",
  city: "Ulaanbaatar",
  district: "Soningon",
  streetAddress: "12-r khoroo",
  postalCode: "210101",
  deliveryInstructions: "Leave at security desk",
};

const address2: AddressData = {
  recipientName: "Jane Doe",
  phoneNumber: "+976 99123457",
  email: "jane@example.com",
  country: "Mongolia",
  city: "Ulaanbaatar",
  district: "Soningon",
  streetAddress: "12-r khoroo",
  postalCode: "210101",
  deliveryInstructions: "Call before arrival",
};

const address3: AddressData = {
  recipientName: "Bob Smith",
  phoneNumber: "+976 99123458",
  email: "bob@example.com",
  country: "Mongolia",
  city: "Erdenet",
  district: "Tsetserleg",
  streetAddress: "5-r building",
  postalCode: "210201",
  deliveryInstructions: "Ring doorbell",
};

export const mockOrders: Order[] = [
  {
    id: "order-1",
    user_id: "user-1",
    product_snapshot: {
      productId: "product-1",
      brandId: "nike",
      name: "Air Force 1 Low",
      imageUrl: null,
    },
    selected_size: "10",
    selected_color: "White",
    quantity: 1,
    subtotal: 120000,
    shipping_fee: 3500,
    total: 265000,
    wire_transaction_id: null,
    status: "completed",
    shipping_address: address1,
    completed_at: "2024-06-20T14:00:00Z",
    created_at: "2024-06-15T10:30:00Z",
    updated_at: "2024-06-20T14:00:00Z",
  },
  {
    id: "order-2",
    user_id: "user-1",
    product_snapshot: {
      productId: "product-3",
      brandId: "new_balance",
      name: "New Balance 550",
      imageUrl: null,
    },
    selected_size: "9",
    selected_color: "Grey",
    quantity: 1,
    subtotal: 85000,
    shipping_fee: 0,
    total: 85000,
    wire_transaction_id: null,
    status: "shipping",
    shipping_address: address2,
    completed_at: null,
    created_at: "2024-06-28T09:00:00Z",
    updated_at: "2024-06-29T16:00:00Z",
  },
  {
    id: "order-3",
    user_id: "user-2",
    product_snapshot: {
      productId: "product-8",
      brandId: "converse",
      name: "Chuck Taylor All Star",
      imageUrl: null,
    },
    selected_size: "9",
    selected_color: "Red",
    quantity: 1,
    subtotal: 45000,
    shipping_fee: 0,
    total: 45000,
    wire_transaction_id: null,
    status: "pending",
    shipping_address: address3,
    completed_at: null,
    created_at: "2024-07-01T12:00:00Z",
    updated_at: "2024-07-01T12:00:00Z",
  },
];

export const mockOrderItems: OrderItem[] = [
  {
    id: "oi-1",
    order_id: "order-1",
    sneaker_id: "sneaker-1",
    quantity: 1,
    price: 120000,
    created_at: "2024-06-15T10:30:00Z",
  },
  {
    id: "oi-2",
    order_id: "order-1",
    sneaker_id: "sneaker-5",
    quantity: 1,
    price: 95000,
    created_at: "2024-06-15T10:30:00Z",
  },
  {
    id: "oi-3",
    order_id: "order-2",
    sneaker_id: "sneaker-3",
    quantity: 1,
    price: 85000,
    created_at: "2024-06-28T09:00:00Z",
  },
  {
    id: "oi-4",
    order_id: "order-3",
    sneaker_id: "sneaker-8",
    quantity: 1,
    price: 45000,
    created_at: "2024-07-01T12:00:00Z",
  },
];

/**
 * Helper: get average rating for a sneaker
 */
export function getAverageRating(sneakerId: string): number {
  const sneakerReviews = mockReviews.filter((r) => r.sneaker_id === sneakerId);
  if (sneakerReviews.length === 0) return 0;
  const sum = sneakerReviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / sneakerReviews.length;
}

/**
 * Helper: get review count for a sneaker
 */
export function getReviewCount(sneakerId: string): number {
  return mockReviews.filter((r) => r.sneaker_id === sneakerId).length;
}

/**
 * Helper: get brand name by id
 */
export function getBrandName(brandId: string | null | undefined): string {
  if (!brandId) return "Брэнд";
  return getBrandNameFromRegistry(brandId);
}

/**
 * Helper: get product details with brand name and rating
 */
export function getProductWithDetails(id: string) {
  const product = mockProducts.find((p) => p.id === id);
  if (!product) return null;
  return {
    ...product,
    brandName: product.brand_id ? getBrandName(product.brand_id) : "",
    avgRating: getAverageRating(id),
    reviewCount: getReviewCount(id),
  };
}
