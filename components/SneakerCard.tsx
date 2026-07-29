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
        <Text style={styles.brand}>{brandName || ""}</Text>
        <Text style={styles.price}>
          {(sneaker.price || 0).toLocaleString("mn-MN")}₮
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const CARD_CORNER_RADIUS = 16;
const IMAGE_HEIGHT = 140;
const IMAGE_HEIGHT_COMPACT = 120;

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.card,
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
    backgroundColor: Colors.light.backgroundSecondary,
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  placeholderText: {
    color: Colors.light.textTertiary,
    fontSize: Typography.caption.fontSize,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  infoPlate: {
    padding: Spacing.sm + 2,
    paddingTop: Spacing.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 17,
    marginBottom: 2,
    textAlign: "left",
  },
  brand: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.light.textTertiary,
    marginBottom: 4,
    textAlign: "left",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "left",
  },
});
