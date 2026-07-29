import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getSneakerWithDetails, mockReviews } from "@/lib/mockData";
import StarRating from "@/components/StarRating";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";

export default function SneakerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState("10");

  const sneaker = getSneakerWithDetails(id as string);

  if (!sneaker) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No results found</Text>
      </SafeAreaView>
    );
  }

  const reviews = mockReviews
    .filter((review) => review.sneaker_id === sneaker.id)
    .slice(0, 4);

  const sizes = [
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
    "10.5",
    "11",
    "11.5",
    "12",
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${sneaker.name} - ${sneaker.price.toLocaleString("mn-MN")}₮`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      "Coming Soon",
      "Cart will be available after backend integration",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sneaker.brandName || "Product"}</Text>
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
        <View style={styles.heroSection}>
          {sneaker.image_url ? (
            <Image
              source={{ uri: sneaker.image_url }}
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
          <View style={styles.productHeader}>
            <View style={styles.titleLeft}>
              <Text style={styles.productBrand}>{sneaker.brandName}</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {sneaker.name}
              </Text>
              {sneaker.model ? (
                <Text style={styles.productModel}>{sneaker.model}</Text>
              ) : null}
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.productPrice}>
                {sneaker.price.toLocaleString("mn-MN")}₮
              </Text>
              {sneaker.original_price ? (
                <Text style={styles.originalPrice}>
                  {sneaker.original_price.toLocaleString("mn-MN")}₮
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.ratingRowCompact}>
            <StarRating
              rating={sneaker.avgRating}
              size={18}
              showCount
              reviewCount={sneaker.reviewCount}
            />
          </View>

          <View style={styles.sectionRow}>
            <View style={styles.detailPill}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>{sneaker.condition || "-"}</Text>
            </View>
            <View style={styles.detailPill}>
              <Text style={styles.detailLabel}>Release</Text>
              <Text style={styles.detailValue}>
                {sneaker.release_date || "-"}
              </Text>
            </View>
          </View>

          {sneaker.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{sneaker.description}</Text>
            </View>
          ) : null}

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sizes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sizeScrollContent}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}>
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
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToCart}>
          <Text style={styles.addToBagText}>Add to Bag</Text>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 32,
    fontWeight: "300",
    color: Colors.light.text,
    marginTop: 2,
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
    paddingBottom: 140,
  },
  heroSection: {
    width: "100%",
    height: 380,
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
    paddingTop: Spacing.md,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  titleLeft: {
    flex: 1,
  },
  productBrand: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.caption.fontWeight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    lineHeight: 28,
  },
  productModel: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textTertiary,
    fontWeight: Typography.body.fontWeight,
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
    marginTop: Spacing.xs,
  },
  ratingRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
  },
  detailPill: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  detailLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textTertiary,
    fontWeight: Typography.caption.fontWeight,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
    fontWeight: Typography.body.fontWeight,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
    marginBottom: Spacing.sm,
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
  sizeScrollContent: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sizeButton: {
    minWidth: 56,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.sm,
  },
  sizeButtonActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint,
  },
  sizeText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  sizeTextActive: {
    color: "#fff",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  addToBagButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: BorderRadius.lg,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  addToBagText: {
    fontSize: Typography.body.fontSize + 2,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
