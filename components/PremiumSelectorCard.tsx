import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(
  require("react-native").Pressable as React.ComponentType<any>,
);

import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

/** Brand chip size */
const BRAND_SIZE = 72;
const LOGO_HEIGHT = 36;

/** Category pill size */
const PILL_HEIGHT = 34;
const PILL_PADDING = 16;

type PremiumSelectorCardProps = {
  id: string;
  label: string;
  imageUrl?: string | null;
  isSelected: boolean;
  onPress: (id: string) => void;
  variant?: "brand" | "category";
};

const PremiumSelectorCard = memo(function PremiumSelectorCard({
  id,
  label,
  imageUrl,
  isSelected,
  onPress,
  variant = "brand",
}: PremiumSelectorCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isBrand = variant === "brand";
  const borderColor = isSelected ? Colors.light.tint : Colors.light.border;
  const labelColor = isSelected && isBrand
    ? Colors.light.tint
    : Colors.light.textSecondary;
  const backgroundColor = isSelected && isBrand
    ? "rgba(0,0,0,0.03)"
    : Colors.light.card;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 400 });
    opacity.value = withTiming(0.8, { duration: 100 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  if (isBrand) {
    return (
      <Animated.View style={animatedStyle}>
        <AnimatedPressable
          onPress={() => onPress(id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.brandContainer,
            {
              borderColor,
              backgroundColor,
              borderWidth: isSelected ? 1.5 : 1,
            },
          ]}>
          <View style={styles.brandLogoContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.brandLogo}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <View style={styles.brandPlaceholder}>
                <Text style={styles.brandPlaceholderText}>{label.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.brandLabel,
              { color: labelColor },
              isSelected && styles.brandLabelSelected,
            ]}
            numberOfLines={1}>
            {label}
          </Text>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  // Category pill variant
  return (
    <AnimatedPressable
      onPress={() => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        onPress(id);
      }}
      style={[
        styles.pillContainer,
        {
          backgroundColor: isSelected ? Colors.light.tint : Colors.light.card,
          borderColor: isSelected ? Colors.light.tint : Colors.light.border,
        },
      ]}>
      <Text
        style={[
          styles.pillLabel,
          { color: isSelected ? "#FFFFFF" : Colors.light.textSecondary },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});

export default PremiumSelectorCard;

const styles = StyleSheet.create({
  // Brand chip styles
  brandContainer: {
    width: BRAND_SIZE,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  brandLogoContainer: {
    width: LOGO_HEIGHT,
    height: LOGO_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  brandLogo: {
    width: LOGO_HEIGHT,
    height: LOGO_HEIGHT,
  },
  brandPlaceholder: {
    width: LOGO_HEIGHT,
    height: LOGO_HEIGHT,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandPlaceholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textTertiary,
  },
  brandLabel: {
    fontSize: Typography.brand.fontSize,
    fontWeight: Typography.brand.fontWeight,
    marginTop: Spacing.xxs,
    letterSpacing: Typography.brand.letterSpacing,
    textAlign: "center",
  },
  brandLabelSelected: {
    fontWeight: "600",
  },

  // Category pill styles
  pillContainer: {
    height: PILL_HEIGHT,
    paddingHorizontal: PILL_PADDING,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: PILL_HEIGHT / 2,
    borderWidth: 1,
  },
  pillLabel: {
    fontSize: Typography.brand.fontSize,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
