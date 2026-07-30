import React, { useRef, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import type { SneakerCardProps } from "@/types";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { IconSymbol } from "./ui/icon-symbol";

const SneakerCard = memo(function SneakerCard({
  sneaker,
  brandName,
  onPress,
  compact = false,
}: SneakerCardProps & { compact?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const imageUri = sneaker.image_url || sneaker.thumb || undefined;
  const isLiked = false;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}>
      <Animated.View
        style={[
          styles.imageContainer,
          compact && styles.imageContainerCompact,
          { transform: [{ scale }] },
        ]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={() => {}}>
          <IconSymbol
            name={isLiked ? "heart.fill" : "heart"}
            size={18}
            color={isLiked ? "#111111" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.infoContainer}>
        <Text style={styles.brand} numberOfLines={1}>
          {brandName || ""}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {sneaker.name}
        </Text>
        <Text style={styles.price}>
          {(sneaker.price || 0).toLocaleString("mn-MN")}₮
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default SneakerCard;

/** Card dimensions */
const CARD_CORNER_RADIUS = 12;
const IMAGE_HEIGHT = 130;
const IMAGE_HEIGHT_COMPACT = 110;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    borderRadius: CARD_CORNER_RADIUS,
    overflow: "hidden",
  },
  cardCompact: {
    marginBottom: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainerCompact: {
    height: IMAGE_HEIGHT_COMPACT,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: Colors.light.textTertiary,
    fontSize: Typography.caption.fontSize,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border,
  },
  infoContainer: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xxs,
  },
  brand: {
    fontSize: Typography.brand.fontSize,
    fontWeight: Typography.brand.fontWeight,
    color: Colors.light.textTertiary,
    letterSpacing: Typography.brand.letterSpacing,
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.productName.fontSize,
    fontWeight: Typography.productName.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.productName.lineHeight,
    letterSpacing: Typography.productName.letterSpacing,
    marginBottom: 4,
  },
  price: {
    fontSize: Typography.price.fontSize,
    fontWeight: Typography.price.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.price.lineHeight,
    letterSpacing: Typography.price.letterSpacing,
  },
});
