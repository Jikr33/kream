import React, { useRef, memo } from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import type { SneakerCardProps } from "@/types";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "./ui/icon-symbol";

/** Premium SneakerCard - Compact, elegant, image-focused */
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
      {/* Image Section - 80% visual attention */}
      <Animated.View style={[styles.imageWrapper, compact && styles.imageWrapperCompact]}>
        <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholder}>No Image</Text>
          )}
        </Animated.View>

        {/* Favorite Button - 30px, subtle */}
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.7}
          onPress={() => {}}>
          <IconSymbol
            name={isLiked ? "heart.fill" : "heart"}
            size={16}
            color={isLiked ? "#111111" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Info Section - Tight spacing */}
      <Animated.View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {brandName || ""}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {sneaker.name}
        </Text>
        <Text style={styles.price}>
          {(sneaker.price || 0).toLocaleString("mn-MN")}₮
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default SneakerCard;

/** Card dimensions - Reduced by ~20% */
const CARD_RADIUS = 18;
const IMAGE_HEIGHT = 105;
const IMAGE_HEIGHT_COMPACT = 90;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: CARD_RADIUS,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardCompact: {
    marginBottom: 0,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapperCompact: {
    height: IMAGE_HEIGHT_COMPACT,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  info: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 10,
  },
  brand: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
  },
});
