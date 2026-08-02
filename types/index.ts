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

export type AddressData = {
  recipientName: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  district: string;
  streetAddress: string;
  postalCode: string;
  deliveryInstructions: string;
};

export type UserProfile = {
  id: string;
  email?: string;
  address?: AddressData;
  created_at?: string;
  updated_at?: string;
};

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
