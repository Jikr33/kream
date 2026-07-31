import React, { memo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";

type CheckoutProductCardProps = {
  brandName: string;
  productName: string;
  color?: string;
  size?: string;
  quantity?: number;
  price: number;
  imageUrl?: string | null;
};

const CheckoutProductCard = memo(function CheckoutProductCard({
  brandName,
  productName,
  color = "White",
  size = "10",
  quantity = 1,
  price,
  imageUrl,
}: CheckoutProductCardProps) {
  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.placeholder}>No Image</Text>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.brand}>{brandName}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {productName}
        </Text>
        <Text style={styles.variant}>
          {color} · Size {size}
        </Text>
        {quantity > 1 && (
          <Text style={styles.quantity}>Qty: {quantity}</Text>
        )}
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {price.toLocaleString("mn-MN")}₮
        </Text>
      </View>
    </View>
  );
});

export default CheckoutProductCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.card,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FAFAF8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  brand: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  variant: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
  },
  quantity: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  priceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
  },
});
