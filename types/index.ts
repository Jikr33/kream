import { Colors } from "@/constants/theme";
import { translationValues } from "@/constants/translations";
import type { TextProps, ViewProps } from "react-native";

export type TableRow<T> = {
  Row: T;
  Insert: T;
  Update: Partial<T>;
  Relationships: never[];
};

export type Brand = {
  id: string;
  name: string;
};

export type Sneaker = {
  id: string;
  brand_id?: string | null;
  name: string;
  model?: string | null;
  description?: string | null;
  price: number;
  original_price?: number | null;
  size?: number | null;
  condition?: string | null;
  release_date?: string | null;
  image_url?: string | null;
  thumb?: string | null;
  stock?: number | null;
  status?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Review = {
  id: string;
  user_id: string;
  sneaker_id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
};

export type Order = {
  id: string;
  user_id?: string | null;
  total_amount: number;
  status: string;
  payment_method?: string | null;
  shipping_address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  sneaker_id: string;
  quantity: number;
  price: number;
  created_at?: string | null;
};

export type SneakerWithDetails = Sneaker & {
  brandName: string;
  avgRating: number;
  reviewCount: number;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  price?: number;
  is_available?: boolean;
  sex?: string | null;
  sizes?: string | null;
  cargo_fee?: number;
  created_at?: string;
  user_id?: string | null;
  brand_id?: string | null;
  image_url?: string | null;
  model?: string;
  status?: string;
  thumb?: string | null;
};

export type SneakerCardProps = {
  sneaker: Sneaker | Product;
  brandName?: string;
  onPress: () => void;
  likes?: number;
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

export type Database = {
  public: {
    Tables: {
      brands: TableRow<Brand>;
      sneakers: TableRow<Sneaker>;
      reviews: TableRow<Review>;
      orders: TableRow<Order>;
      order_items: TableRow<OrderItem>;
    };
  };
};
