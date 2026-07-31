import React, { useRef, memo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import type { SneakerCardProps } from "@/types";
import { Colors } from "@/constants/theme";

/** Premium SneakerCard - Compact, elegant, image-focused */
const SneakerCard = memo(function SneakerCard({
  sneaker,
  brandName,
  onPress,
  compact = false,
}: SneakerCardProps & { compact?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const imageUri = sneaker.image_url || sneaker.thumb || undefined;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.97,
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
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.92}>
      <Animated.View
        style={[
          styles.cardInner,
          compact && styles.cardInnerCompact,
          { transform: [{ scale }] },
        ]}>
        {/* Image Hero */}
        <View
          style={[styles.imageWrapper, compact && styles.imageWrapperCompact]}>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info - Minimal, tight */}
        <View style={[styles.info, compact && styles.infoCompact]}>
          {brandName ? (
            <Text style={styles.brand} numberOfLines={1}>
              {brandName}
            </Text>
          ) : null}
          <Text style={styles.name} numberOfLines={2}>
            {sneaker.name}
          </Text>
          <Text style={styles.price}>
            {(sneaker.price || 0).toLocaleString("mn-MN")}₮
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default SneakerCard;

/** Premium Card Dimensions */
const CARD_RADIUS = 14;
const IMAGE_HEIGHT = 120;
const IMAGE_HEIGHT_COMPACT = 110;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0,
  },
  cardCompact: {
    marginBottom: 0,
  },
  cardInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  cardInnerCompact: {
    marginBottom: 0,
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    backgroundColor: Colors.light.backgroundSecondary,
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
    flex: 1,
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 4,
  },
  infoCompact: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 2,
  },
  brand: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
    letterSpacing: 0.15,
    marginTop: 4,
  },
});
