import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { getProductWithDetails, mockReviews } from "@/lib/mockData";
import StarRating from "@/components/StarRating";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { saveCart, getCart } from "@/utils/storage";
import { fetchColorSize, fetchDetail } from "@/supabase";
import type { Product, ProductWithDetails } from "@/types";

type CartItem = {
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

export default function SneakerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [sneaker, setSneaker] = useState<ProductWithDetails | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(
    sneaker?.available_sizes?.[0] || 10,
  );
  const [selectedColor, setSelectedColor] = useState<string>("Default");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    async function loadColorSizes() {
      try {
        const { detail, error } = await fetchDetail(id);
        if (!error && detail && detail.length > 0) {
          // Use available_sizes from product if Supabase doesn't return data
          setAvailableSizes(sneaker?.available_sizes || []);
          setAvailableColors(sneaker?.available_colors || []);
          setSneaker(detail[0] as ProductWithDetails);
        }
      } catch (error) {
        console.error("Failed to load Color n sizes:", error);
      }
    }
    loadColorSizes();
  }, []);

  const handleShare = useCallback(async () => {
    if (!sneaker) return;

    try {
      await Share.share({
        message: `${sneaker.name} - ${sneaker.price.toLocaleString("mn-MN")}₮`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [sneaker]);

  const addToCart = useCallback(async () => {
    if (!sneaker) return;

    setIsAddingToCart(true);

    const cartItem: CartItem = {
      id: `${sneaker.id}-${selectedSize}-${selectedColor}`,
      sneakerId: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand_id,
      price: sneaker.price,
      thumb: sneaker.thumb,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    };

    try {
      // Get existing cart
      const existingCart = await getCart();
      const cart = existingCart?.items || [];

      // Check if item already exists
      const existingIndex = cart.findIndex(
        (item: CartItem) =>
          item.sneakerId === cartItem.sneakerId &&
          item.size === cartItem.size &&
          item.color === cartItem.color,
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push(cartItem);
      }

      await saveCart({ items: cart, updatedAt: Date.now() });

      // Navigate to cart
      router.push("/(tabs)/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [sneaker, selectedSize, selectedColor, quantity, router]);

  const handleCheckout = useCallback(
    (id: string) =>
      router.push({
        pathname: "/checkout",
        params: { id },
      }),
    [router],
  );

  // // Save current selection to cart before checkout
  // const cartItem: CartItem = {
  //   id: `${sneaker.id}-${selectedSize}-${selectedColor}`,
  //   sneakerId: sneaker.id,
  //   name: sneaker.name,
  //   brand: sneaker.brand_id,
  //   price: sneaker.price,
  //   thumb: sneaker.thumb,
  //   size: selectedSize,
  //   color: selectedColor,
  //   quantity: quantity,
  // };

  // // Save to cart
  // getCart().then((existingCart) => {
  //   const cart = existingCart?.items || [];
  //   const existingIndex = cart.findIndex(
  //     (item: CartItem) =>
  //       item.sneakerId === cartItem.sneakerId &&
  //       item.size === cartItem.size &&
  //       item.color === cartItem.color,
  //   );

  //   if (existingIndex >= 0) {
  //     cart[existingIndex].quantity = quantity;
  //   } else {
  //     cart.push(cartItem);
  //   }

  //   saveCart({ items: cart, updatedAt: Date.now() }).then(() => {
  //     // Navigate to checkout
  //     router.push({
  //       pathname: "/checkout",
  //       params: {
  //         sneakerId: sneaker.id,
  //         size: selectedSize,
  //         color: selectedColor,
  //         quantity: quantity.toString(),
  //       },
  //     });
  //   });
  // });
  // [sneaker, selectedSize, selectedColor, quantity, router]

  const handleSizeSelect = useCallback((size: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSize(size);
  }, []);

  const handleColorSelect = useCallback((colorName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(colorName);
  }, []);

  const handleQuantityChange = useCallback(
    (delta: number) => {
      const newQuantity = quantity + delta;
      if (newQuantity >= 1 && newQuantity <= 10) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setQuantity(newQuantity);
      }
    },
    [quantity],
  );

  if (!sneaker) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No results found</Text>
      </SafeAreaView>
    );
  }

  const totalPrice = sneaker.price * quantity;

  const reviews = mockReviews
    .filter((review) => review.sneaker_id === sneaker.id)
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sneaker.brand_id || "Product"}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Text style={styles.headerIcon}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsFavorite((prev) => !prev)}>
            <Text style={styles.headerIcon}>{isFavorite ? "♥" : "♡"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Image - Reduced height */}
        <View style={styles.heroSection}>
          {sneaker.thumb ? (
            <Image
              source={{ uri: sneaker.thumb }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderHero}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Compact Product Header */}
          <View style={styles.productHeader}>
            <View style={styles.titleLeft}>
              <Text style={styles.productBrand}>{sneaker.brand_id}</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {sneaker.name}
              </Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.productPrice}>
                {sneaker.price.toLocaleString("mn-MN")}₮
              </Text>
              {/* Original price not in new schema */}
            </View>
          </View>

          {/* Compact Rating */}
          <View style={styles.ratingRowCompact}>
            <StarRating
              rating={sneaker.avgRating || 0}
              size={16}
              showCount
              reviewCount={sneaker.reviewCount || 0}
            />
          </View>

          {/* Compact Color Selector */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((color: string) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorChip,
                    selectedColor === color && styles.colorChipActive,
                  ]}
                  onPress={() => handleColorSelect(color)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorPreviewActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.colorChipText,
                      selectedColor === color && styles.colorChipTextActive,
                    ]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Compact Size Selector */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Size</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sizeScrollContent}>
              {availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => handleSizeSelect(size)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextActive,
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quantity Selector */}
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.quantityButtonText,
                    quantity <= 1 && styles.quantityButtonTextDisabled,
                  ]}>
                  −
                </Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= 10 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.quantityButtonText,
                    quantity >= 10 && styles.quantityButtonTextDisabled,
                  ]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {sneaker.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{sneaker.description}</Text>
            </View>
          ) : null}

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.length > 0 ? (
                <Text style={styles.sectionAction}>View all</Text>
              ) : null}
            </View>
            {reviews.length === 0 ? (
              <Text style={styles.emptyText}>No reviews yet</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{review.user_id}</Text>
                    <View style={styles.reviewRatingBadge}>
                      <Text style={styles.reviewRating}>{review.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>

          {/* Bottom spacing for sticky bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Premium Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCart}
          activeOpacity={0.9}
          disabled={isAddingToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.98}
          disabled={isAddingToCart}>
          <Text style={styles.checkoutPrice}>
            ₮{totalPrice.toLocaleString("mn-MN")}
          </Text>
          <Text style={styles.checkoutLabel}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  headerIcon: {
    fontSize: 16,
    color: Colors.light.text,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  heroSection: {
    width: "100%",
    height: 280,
    overflow: "hidden",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  placeholderHero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: Colors.light.textTertiary,
    fontSize: Typography.body.fontSize,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  titleLeft: {
    flex: 1,
  },
  productBrand: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.caption.fontWeight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 22,
  },
  productModel: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textTertiary,
    fontWeight: Typography.body.fontWeight,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
  },
  originalPrice: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textTertiary,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  ratingRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  selectorSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
    marginBottom: Spacing.sm,
  },
  selectorLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.light.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionAction: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.caption.fontWeight,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    lineHeight: Typography.body.lineHeight + 4,
  },
  reviewCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewUser: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
    fontWeight: Typography.body.fontWeight,
  },
  reviewRatingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  reviewRating: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.text,
    fontWeight: Typography.caption.fontWeight,
  },
  reviewText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    lineHeight: Typography.body.lineHeight + 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    minHeight: 36,
  },
  colorChipActive: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  colorPreviewActive: {
    borderColor: "#fff",
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.textSecondary,
  },
  colorChipTextActive: {
    fontWeight: "600",
    color: "#fff",
  },
  sizeScrollContent: {
    flexDirection: "row",
    gap: 8,
  },
  sizeButton: {
    minWidth: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 14,
  },
  sizeButtonActive: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  sizeTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: "400",
    color: Colors.light.text,
  },
  quantityButtonTextDisabled: {
    color: Colors.light.textTertiary,
  },
  quantityText: {
    fontSize: Typography.body.fontSize + 2,
    fontWeight: "700",
    color: Colors.light.text,
    minWidth: 40,
    textAlign: "center",
  },
  bottomSpacer: {
    height: Spacing.lg,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    flexDirection: "row",
    gap: 10,
  },
  addToCartButton: {
    flex: 0.35,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.text,
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.2,
  },
  checkoutButton: {
    flex: 0.65,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.text,
  },
  checkoutPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  checkoutLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
});
