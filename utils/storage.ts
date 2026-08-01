import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  GUEST_ADDRESS: "kream_guest_address",
  CART: "kream_cart",
} as const;

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

export async function getGuestAddress(): Promise<AddressData | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.GUEST_ADDRESS);
    return data ? JSON.parse(data) : null;
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

export async function getCart(): Promise<any | null> {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.CART);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[Storage] Failed to get cart:", error);
    return null;
  }
}

export async function saveCart(cart: any): Promise<void> {
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
