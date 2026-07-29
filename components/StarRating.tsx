import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { StarRatingProps } from "@/types";
import { Colors, Typography, Spacing } from "@/constants/theme";

export default function StarRating({
  rating,
  size = 16,
  showCount = false,
  reviewCount = 0,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {[...Array(fullStars)].map((_, i) => (
        <MaterialCommunityIcons
          key={`full-${i}`}
          name="star"
          size={size}
          color={Colors.light.tint}
        />
      ))}
      {hasHalfStar && (
        <MaterialCommunityIcons
          name="star-half-full"
          size={size}
          color={Colors.light.tint}
        />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={size}
          color={Colors.light.border}
        />
      ))}
      {showCount && reviewCount > 0 && (
        <View style={styles.countContainer}>
          <View style={styles.divider} />
          <Text style={styles.countText}>{reviewCount} reviews</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  countContainer: {
    marginLeft: Spacing.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.sm,
  },
  countText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
  },
});
