import * as SecureStore from "expo-secure-store";

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

const STORAGE_KEY = "user_address";
const LEGACY_STORAGE_KEY = "kream_guest_address";

let globalAddress: UserAddress | null = null;
let listeners: Set<(address: UserAddress | null) => void> = new Set();

function notify() {
  listeners.forEach((fn) => fn(globalAddress));
}

export function getAddress(): UserAddress | null {
  return globalAddress;
}

export function setAddress(address: UserAddress | null) {
  globalAddress = address;
  if (address) {
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(address)).catch(
      (error) => {
        console.error("[AddressStore] Failed to save address:", error);
      },
    );
  } else {
    SecureStore.deleteItemAsync(STORAGE_KEY).catch((error) => {
      console.error("[AddressStore] Failed to clear address:", error);
    });
  }
  notify();
}

export function clearAddress() {
  globalAddress = null;
  SecureStore.deleteItemAsync(STORAGE_KEY).catch((error) => {
    console.error("[AddressStore] Failed to clear address:", error);
  });
  notify();
}

export function subscribeAddress(
  listener: (address: UserAddress | null) => void,
) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadAddressFromStorage(): Promise<UserAddress | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      globalAddress = JSON.parse(raw) as UserAddress;
      notify();
      return globalAddress;
    }

    // Migrate legacy guest address if present
    const legacy = await SecureStore.getItemAsync(LEGACY_STORAGE_KEY);
    if (legacy) {
      const legacyData = JSON.parse(legacy);
      if (legacyData) {
        const migrated: UserAddress = {
          name: legacyData.recipientName || "",
          phone: legacyData.phoneNumber || "",
          email: legacyData.email || "",
          city: legacyData.city || "Ulaanbaatar",
          district: legacyData.district || "",
          street: legacyData.streetAddress || "",
          postalCode: legacyData.postalCode || undefined,
          deliveryInstructions: legacyData.deliveryInstructions || "",
        };
        globalAddress = migrated;
        SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(migrated)).catch(
          (error) => {
            console.error("[AddressStore] Failed to migrate address:", error);
          },
        );
        SecureStore.deleteItemAsync(LEGACY_STORAGE_KEY).catch((error) => {
          console.error(
            "[AddressStore] Failed to clear legacy address:",
            error,
          );
        });
        notify();
        return globalAddress;
      }
    }
  } catch (error) {
    console.error("[AddressStore] Failed to load address:", error);
  }
  globalAddress = null;
  notify();
  return null;
}
