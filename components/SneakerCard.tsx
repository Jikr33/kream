import React, { useRef, memo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import type { SneakerCardProps } from "@/types";
import { getBrandName } from "@/constants/brands";
import { Colors } from "@/constants/theme";

/**
 * SneakerCard
 * ===========
 * Uniform, image-dominant, premium product card.
 *
 * Design rules:
 *  - Every card has an IDENTICAL fixed height (compact is the standard).
 *  - The image area dominates (~70% of card height) and uses contain
 *    so it is never cropped, stretched, or distorted.
 *  - The info area is compact (~30% shorter than before) with tight
 *    padding and line spacing.
 *  - Product name is capped at 2 lines and never grows the card.
 *  - Brand is quiet (11px, medium, muted grey).
 *  - Price is prominent and always aligned consistently.
 *  - Cards never resize based on image dimensions, name length, brand,
 *    or price.
 */

// One fixed height for every card. Compact is the standard.
const CARD_HEIGHT = 210;
const CARD_RADIUS = 12;

// Image area dominates the card. ~70% of height.
const IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.7); // 147

// Info area is compact and fixed.
const INFO_HEIGHT = CARD_HEIGHT - IMAGE_HEIGHT; // 63

const SneakerCard = memo(function SneakerCard({
  sneaker,
  onPress,
}: SneakerCardProps & { compact?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const imageUri = sneaker.thumb || undefined;
  const brandName = getBrandName(sneaker.brand_id);

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.92}
      accessibilityLabel={`${brandName} ${sneaker.name}`}
      accessibilityRole="button">
      <Animated.View style={[styles.cardInner, { transform: [{ scale }] }]}>
        {/* Image Hero — fixed height, contain, centered */}
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={120}
              recyclingKey={sneaker.id}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Info — compact, fixed height, never grows */}
        <View style={styles.info}>
          {brandName ? (
            <Text style={styles.brand} numberOfLines={1}>
              {brandName}
            </Text>
          ) : null}
          <Text style={styles.name} numberOfLines={2}>
            {sneaker.name}
          </Text>
          <Text style={styles.price}>
            {sneaker.price.toLocaleString("mn-MN")}₮
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default SneakerCard;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: Colors.light.card,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInner: {
    height: CARD_HEIGHT,
    backgroundColor: Colors.light.card,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    width: "100%",
    overflow: "hidden",
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  placeholderText: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  info: {
    height: INFO_HEIGHT,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 7,
    gap: 2,
    justifyContent: "flex-start",
  },
  brand: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
    letterSpacing: 0.1,
    marginTop: "auto",
  },
});
