import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { getCart } from "@/utils/storage";

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cart = await getCart();
    if (cart?.items) {
      setCartItems(cart.items);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.headerRight} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)/explore")}>
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cartContent}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>
                {item.brand} • Size: {item.size} • Qty: {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₮{(item.price * item.quantity).toLocaleString("mn-MN")}
              </Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    flex: 1,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.body.fontWeight,
  },
  shopButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: Spacing.lg + 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  shopButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: "#fff",
    letterSpacing: 0.3,
  },
  cartContent: {
    flex: 1,
    padding: Spacing.md,
  },
  cartItem: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  itemName: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: Typography.body.fontSize,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "right",
  },
});
