import React, { useRef } from "react";
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

export default function SneakerCard({
  sneaker,
  brandName,
  onPress,
  compact = false,
}: SneakerCardProps & { compact?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const imageUri = sneaker.image_url || sneaker.thumb || undefined;
  const isLiked = false;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={() => {
        animatePress();
        onPress();
      }}
      activeOpacity={0.95}>
      <Animated.View
        style={[
          styles.imageContainer,
          compact && styles.imageContainerCompact,
          { transform: [{ scale }] },
        ]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.8}
          onPress={() => {}}>
          <IconSymbol
            name={isLiked ? "heart.fill" : "heart"}
            size={20}
            color={isLiked ? "#111111" : "#6B7280"}
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.infoPlate}>
        <Text style={styles.name} numberOfLines={2}>
          {sneaker.name}
        </Text>
        <Text style={styles.brand}>{brandName || "Brand"}</Text>
        <Text style={styles.price}>
          {(sneaker.price || 0).toLocaleString("mn-MN")}₮
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const CARD_CORNER_RADIUS = 22;
const IMAGE_HEIGHT = 160;
const IMAGE_HEIGHT_COMPACT = 135;

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
    borderRadius: CARD_CORNER_RADIUS,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  cardCompact: {
    marginBottom: 0,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: IMAGE_HEIGHT,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  imageContainerCompact: {
    height: IMAGE_HEIGHT_COMPACT,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: Colors.light.textTertiary,
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.caption.fontWeight,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  infoPlate: {
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 18,
    letterSpacing: 0.1,
    marginBottom: 1,
    textAlign: "center",
  },
  brand: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    lineHeight: 14,
    letterSpacing: 0.8,
    marginBottom: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    lineHeight: 20,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
