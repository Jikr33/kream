/**
 * Kream Outlet – Mock Data
 * ========================
 * Realistic mock data for design preview and offline development.
 * The data service (lib/data.ts) automatically falls back to this
 * when Supabase is not configured or returns errors.
 */

import type { Brand, Order, OrderItem, Review, Sneaker } from "@/types";

export const mockBrands: (Brand & { thumb?: string | null })[] = [
  {
    id: "brand-1",
    name: "Nike",
    thumb: "https://cdn.simpleicons.org/nike",
  },
  {
    id: "brand-2",
    name: "Adidas",
    thumb: "https://cdn.simpleicons.org/adidas",
  },
  {
    id: "brand-3",
    name: "New Balance",
    thumb: "https://cdn.simpleicons.org/newbalance",
  },
  {
    id: "brand-4",
    name: "ASICS",
    thumb: "https://cdn.simpleicons.org/asics",
  },
  {
    id: "brand-5",
    name: "Salomon",
    thumb: "https://cdn.simpleicons.org/salomon",
  },
  {
    id: "brand-6",
    name: "Converse",
    thumb: "https://cdn.simpleicons.org/converse",
  },
  {
    id: "brand-7",
    name: "Vans",
    thumb: "https://cdn.simpleicons.org/vans",
  },
  {
    id: "brand-8",
    name: "Timberland",
    thumb: "https://cdn.simpleicons.org/timberland",
  },
  {
    id: "brand-9",
    name: "Dr. Martens",
    thumb: "https://cdn.simpleicons.org/drmartens",
  },
  {
    id: "brand-10",
    name: "Puma",
    thumb: "https://cdn.simpleicons.org/puma",
  },
  {
    id: "brand-11",
    name: "Hoka",
    thumb: "https://cdn.simpleicons.org/hoka",
  },
  {
    id: "brand-12",
    name: "Reebok",
    thumb: "https://cdn.simpleicons.org/reebok",
  },
  {
    id: "brand-13",
    name: "Jordan",
    thumb: "https://cdn.simpleicons.org/jordan",
  },
  {
    id: "brand-14",
    name: "Balenciaga",
    thumb: "https://cdn.simpleicons.org/balenciaga",
  },
  {
    id: "brand-15",
    name: "Gucci",
    thumb: "https://cdn.simpleicons.org/gucci",
  },
  {
    id: "brand-16",
    name: "Louis Vuitton",
    thumb: "https://cdn.simpleicons.org/louisvuitton",
  },
  {
    id: "brand-17",
    name: "Dior",
    thumb: "https://cdn.simpleicons.org/dior",
  },
  {
    id: "brand-18",
    name: "Prada",
    thumb: "https://cdn.simpleicons.org/prada",
  },
  {
    id: "brand-19",
    name: "Fendi",
    thumb: "https://cdn.simpleicons.org/fendi",
  },
  {
    id: "brand-20",
    name: "Off-White",
    thumb: "https://cdn.simpleicons.org/offwhite",
  },
];

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

export const mockSneakers: Sneaker[] = [
  {
    id: "sneaker-1",
    brand_id: "brand-1",
    name: "Air Force 1 Low",
    model: "AF1",
    description:
      "The iconic Nike Air Force 1 Low in pristine white leather. Features a clean upper with perforated detailing and a comfortable Air cushioned midsole.",
    price: 120000,
    original_price: 180000,
    size: 10,
    condition: "new",
    release_date: "2024-01-15",
    image_url:
      "https://unsplash.com/photos/green-and-black-nike-athletic-shoe-kP6knT7tjn4",
    stock: 5,
    status: "active",
    category: "lifestyle",
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "sneaker-2",
    brand_id: "brand-2",
    name: "Ultraboost 22",
    model: "BBPB35",
    description:
      "Adidas Ultraboost 22 with Boost midsole for responsive energy return. Features a Primeknit upper and Torsion System for stability.",
    price: 145000,
    original_price: 220000,
    size: 9,
    condition: "like_new",
    release_date: "2024-03-20",
    image_url:
      "https://unsplash.com/photos/unpaired-off-white-x-nike-air-force-1-low-top-sneaker-PqbL_mxmaUE",
    stock: 3,
    status: "active",
    category: "running",
    created_at: "2024-06-05T10:00:00Z",
    updated_at: "2024-06-05T10:00:00Z",
  },
  {
    id: "sneaker-3",
    brand_id: "brand-3",
    name: "New Balance 550",
    model: "M550",
    description:
      "New Balance 550 with classic suede and mesh upper. Features ENCAP midsole for cushioning and a durable outsole.",
    price: 85000,
    original_price: 130000,
    size: 11,
    condition: "good",
    release_date: "2023-11-10",
    image_url:
      "https://unsplash.com/photos/black-and-white-nike-athletic-shoes-s-gYAbQToXk",
    stock: 7,
    status: "active",
    category: "lifestyle",
    created_at: "2024-06-10T10:00:00Z",
    updated_at: "2024-06-10T10:00:00Z",
  },
  {
    id: "sneaker-4",
    brand_id: "brand-1",
    name: "Air Jordan 1 Retro",
    model: "AJ1",
    description:
      "Air Jordan 1 Retro in the iconic 'Chicago' colorway. Premium leather upper with Nike Air cushioning in the heel.",
    price: 280000,
    original_price: 400000,
    size: 10.5,
    condition: "like_new",
    release_date: "2024-05-01",
    image_url:
      "https://unsplash.com/photos/blue-and-black-nike-high-top-sneakers-BWPqHZBhMVA",
    stock: 2,
    status: "active",
    category: "basketball",
    created_at: "2024-06-15T10:00:00Z",
    updated_at: "2024-06-15T10:00:00Z",
  },
  {
    id: "sneaker-5",
    brand_id: "brand-4",
    name: "RS-X Core",
    model: "391377",
    description:
      "Puma RS-X Core with bold retro design. Features a thick midsole with visible Torsion System and breathable mesh upper.",
    price: 95000,
    original_price: 140000,
    size: 9.5,
    condition: "new",
    release_date: "2024-02-12",
    image_url:
      "https://images.unsplash.com/photo-1597044175934-8d4d6d4d6b5e?w=800&h=800&fit=crop",
    stock: 4,
    status: "active",
    category: "lifestyle",
    created_at: "2024-06-20T10:00:00Z",
    updated_at: "2024-06-20T10:00:00Z",
  },
  {
    id: "sneaker-6",
    brand_id: "brand-5",
    name: "Old Skool",
    model: "VN000D0B",
    description:
      "Vans Old Skool in classic black and white. Canvas upper with signature Waffle outsole for grip and durability.",
    price: 55000,
    original_price: 80000,
    size: 8,
    condition: "fair",
    release_date: "2023-09-05",
    image_url:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=800&fit=crop",
    stock: 10,
    status: "active",
    category: "skate",
    created_at: "2024-06-25T10:00:00Z",
    updated_at: "2024-06-25T10:00:00Z",
  },
  {
    id: "sneaker-7",
    brand_id: "brand-1",
    name: "Air Max 90",
    model: "AO4436",
    description:
      "Nike Air Max 90 with visible Air unit in the midsole. Features a synthetic upper with mesh panels for breathability.",
    price: 110000,
    original_price: 160000,
    size: 9,
    condition: "good",
    release_date: "2024-04-08",
    image_url:
      "https://images.unsplash.com/photo-1509107776819-8958f5a2ac6f?w=800&h=800&fit=crop",
    stock: 0,
    status: "sold_out",
    category: "running",
    created_at: "2024-06-28T10:00:00Z",
    updated_at: "2024-06-28T10:00:00Z",
  },
  {
    id: "sneaker-8",
    brand_id: "brand-6",
    name: "Chuck Taylor All Star",
    model: "A03654",
    description:
      "Converse Chuck Taylor All Star high-top in classic canvas. Iconic design with rubber toe cap and vulcanized sole.",
    price: 45000,
    original_price: null,
    size: 7,
    condition: "new",
    release_date: "2024-01-20",
    image_url:
      "https://images.unsplash.com/photo-1519559909489-57f5d5d3a6ec?w=800&h=800&fit=crop",
    stock: 6,
    status: "active",
    category: "lifestyle",
    created_at: "2024-07-01T10:00:00Z",
    updated_at: "2024-07-01T10:00:00Z",
  },
  {
    id: "sneaker-9",
    brand_id: "brand-10",
    name: "RS-X Reinvention",
    model: "374891-01",
    description:
      "Puma RS-X Reinvention with bold retro aesthetic. Features chunky midsole, leather and mesh upper with reflective detailing.",
    price: 135000,
    original_price: 180000,
    size: 9,
    condition: "new",
    release_date: "2024-03-15",
    image_url:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop",
    stock: 4,
    status: "active",
    category: "lifestyle",
    created_at: "2024-07-05T10:00:00Z",
    updated_at: "2024-07-05T10:00:00Z",
  },
  {
    id: "sneaker-10",
    brand_id: "brand-13",
    name: "Air Jordan 4 Retro",
    model: "DC9530-001",
    description:
      "Air Jordan 4 Retro in 'Military Black' colorway. Premium leather and mesh construction with iconic Air cushioning and visible Nike Air unit.",
    price: 450000,
    original_price: 550000,
    size: 10.5,
    condition: "new",
    release_date: "2024-06-15",
    image_url:
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop",
    stock: 2,
    status: "active",
    category: "basketball",
    created_at: "2024-07-08T10:00:00Z",
    updated_at: "2024-07-08T10:00:00Z",
  },
  {
    id: "sneaker-11",
    brand_id: "brand-14",
    name: "Triple S Sneaker",
    model: "568593-W2SN1-9000",
    description:
      "Balenciaga Triple S in black and white. Features Triple S sole construction with leather, mesh and nubuck upper in a deconstructed aesthetic.",
    price: 1200000,
    original_price: 1450000,
    size: 42,
    condition: "like_new",
    release_date: "2024-02-01",
    image_url:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop",
    stock: 1,
    status: "active",
    category: "luxury",
    created_at: "2024-07-10T10:00:00Z",
    updated_at: "2024-07-10T10:00:00Z",
  },
  {
    id: "sneaker-12",
    brand_id: "brand-15",
    name: "Tennis 1977 Sneaker",
    model: "606497-KK00F-1000",
    description:
      "Gucci Tennis 1977 in white leather with embossed Web detail. Features GG embossed leather sole and classic low-top silhouette.",
    price: 980000,
    original_price: 1150000,
    size: 41,
    condition: "new",
    release_date: "2024-04-20",
    image_url:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop",
    stock: 3,
    status: "active",
    category: "luxury",
    created_at: "2024-07-12T10:00:00Z",
    updated_at: "2024-07-12T10:00:00Z",
  },
  {
    id: "sneaker-13",
    brand_id: "brand-16",
    name: "LV Trainer Sneaker",
    model: "1A9U6T-1A9W5U",
    description:
      "Louis Vuitton LV Trainer in monogram canvas and leather. embroidered Monogram flowers and Louis Vuitton signature on the side.",
    price: 1650000,
    original_price: 1950000,
    size: 42,
    condition: "like_new",
    release_date: "2024-05-10",
    image_url:
      "https://images.unsplash.com/photo-1606171656699-ffea0f3ab2e4?w=800&h=800&fit=crop",
    stock: 1,
    status: "active",
    category: "luxury",
    created_at: "2024-07-14T10:00:00Z",
    updated_at: "2024-07-14T10:00:00Z",
  },
  {
    id: "sneaker-14",
    brand_id: "brand-17",
    name: "B23 High-Top Sneaker",
    model: "3SN232ZYP-H038",
    description:
      "Dior B23 High-Top in Oblique canvas with technical mesh. Features Dior signature and CD diamond motif on the side and rubber sole.",
    price: 1450000,
    original_price: 1700000,
    size: 43,
    condition: "new",
    release_date: "2024-06-01",
    image_url:
      "https://images.unsplash.com/photo-1583241800698-e8ab018302a0?w=800&h=800&fit=crop",
    stock: 2,
    status: "active",
    category: "luxury",
    created_at: "2024-07-15T10:00:00Z",
    updated_at: "2024-07-15T10:00:00Z",
  },
  {
    id: "sneaker-15",
    brand_id: "brand-18",
    name: "Prada America's Cup Sneaker",
    model: "2EG320-066-F0002",
    description:
      "Prada America's Cup sneaker in brushed leather with Prada Linea Rossa triangle logo. Features technical fabric lining and rubber sole.",
    price: 1100000,
    original_price: 1300000,
    size: 42,
    condition: "good",
    release_date: "2024-03-25",
    image_url:
      "https://images.unsplash.com/photo-1539184441678-9b8158f1e582?w=800&h=800&fit=crop",
    stock: 2,
    status: "active",
    category: "luxury",
    created_at: "2024-07-16T10:00:00Z",
    updated_at: "2024-07-16T10:00:00Z",
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

export const mockOrders: Order[] = [
  {
    id: "order-1",
    user_id: "user-1",
    total_amount: 265000,
    status: "delivered",
    payment_method: "cod",
    shipping_address: "Улаанбатор, Сонингон, 12-р хороолол",
    created_at: "2024-06-15T10:30:00Z",
    updated_at: "2024-06-20T14:00:00Z",
  },
  {
    id: "order-2",
    user_id: "user-1",
    total_amount: 85000,
    status: "shipped",
    payment_method: "cod",
    shipping_address: "Улаанбатор, Сонингон, 12-р хороолол",
    created_at: "2024-06-28T09:00:00Z",
    updated_at: "2024-06-29T16:00:00Z",
  },
  {
    id: "order-3",
    user_id: "user-2",
    total_amount: 45000,
    status: "pending",
    payment_method: "cod",
    shipping_address: "Эрдэнэт, Цэцгийн гудамж, 5-р байр",
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
  const brand = mockBrands.find((b) => b.id === brandId);
  return brand?.name ?? "Брэнд";
}

/**
 * Helper: get full sneaker with brand name and rating
 */
export function getSneakerWithDetails(id: string) {
  const sneaker = mockSneakers.find((s) => s.id === id);
  if (!sneaker) return null;
  return {
    ...sneaker,
    brandName: sneaker.brand_id || "",
    avgRating: getAverageRating(sneaker.id),
    reviewCount: getReviewCount(sneaker.id),
  };
}
