import * as SecureStore from "expo-secure-store";
import type { AddressData } from "@/types";

const STORAGE_KEYS = {
  GUEST_ADDRESS: "kream_guest_address",
  CART: "kream_cart",
} as const;

export type { AddressData };

export type CartItem = {
  id: string;
  sneakerId: string;
  name: string;
  brand: string;
  price: number;
  thumb: string | null;
  size: number;
  color: string;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  updatedAt: number;
};

export type CheckoutCart = {
  product: {
    brand_id: string;
    name: string;
    price: number;
    thumb: string | null;
  };
  variant: {
    size: string;
    color: string;
    quantity: number;
    availableSizes: string[];
    availableColors: { name: string; value: string }[];
    maxStock: number;
  };
  shippingMethod: "standard" | "express";
};

export async function getGuestAddress(): Promise<AddressData | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.GUEST_ADDRESS);
    return data ? (JSON.parse(data) as AddressData) : null;
  } catch (error) {
    console.error("[Storage] Failed to get guest address:", error);
    return null;
  }
}

export async function saveGuestAddress(address: AddressData): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.GUEST_ADDRESS,
      JSON.stringify(address),
    );
  } catch (error) {
    console.error("[Storage] Failed to save guest address:", error);
  }
}

export async function clearGuestAddress(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.GUEST_ADDRESS);
  } catch (error) {
    console.error("[Storage] Failed to clear guest address:", error);
  }
}

export async function getCart(): Promise<Cart | CheckoutCart | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.CART);
    return data ? (JSON.parse(data) as Cart | CheckoutCart) : null;
  } catch (error) {
    console.error("[Storage] Failed to get cart:", error);
    return null;
  }
}

export async function saveCart(cart: Cart | CheckoutCart): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error("[Storage] Failed to save cart:", error);
  }
}

export async function clearCart(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.CART);
  } catch (error) {
    console.error("[Storage] Failed to clear cart:", error);
  }
}
