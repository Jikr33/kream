import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(
  require("react-native").Pressable as React.ComponentType<any>,
);

import { Colors } from "@/constants/theme";

/** Brand chip size - Compact 66px */
const BRAND_SIZE = 66;
const LOGO_SIZE = 32;

/** Category pill size - Filter style */
const PILL_HEIGHT = 35;
const PILL_PADDING = 16;

type PremiumSelectorCardProps = {
  id: string;
  label: string;
  imageUrl?: string | null;
  isSelected: boolean;
  onPress: (id: string) => void;
  variant?: "brand" | "category";
};

/** Premium Brand Selector Chip */
const PremiumSelectorCard = memo(function PremiumSelectorCard({
  id,
  label,
  imageUrl,
  isSelected,
  onPress,
  variant = "brand",
}: PremiumSelectorCardProps) {
  const isBrand = variant === "brand";

  const borderColor = isSelected ? "#111111" : "#E5E5E5";
  const backgroundColor = isSelected ? "#F6F6F6" : "#FFFFFF";
  const labelColor = isSelected ? "#111111" : "#6B7280";

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor, { duration: 150 }),
    backgroundColor: withTiming(backgroundColor, { duration: 150 }),
  }));

  const handlePress = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  if (isBrand) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        style={[styles.brandContainer, animatedStyle]}>
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
            <Text style={styles.brandInitial}>{label.charAt(0)}</Text>
          )}
        </View>
        <Text
          style={[styles.brandLabel, { color: labelColor }]}
          numberOfLines={1}>
          {label}
        </Text>
      </AnimatedPressable>
    );
  }

  // Category pill variant - Filter pills
  const pillBg = isSelected ? "#111111" : "#FFFFFF";
  const pillBorder = isSelected ? "#111111" : "#E5E5E5";
  const pillText = isSelected ? "#FFFFFF" : "#6B7280";

  return (
    <AnimatedPressable
      onPress={() => {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        onPress(id);
      }}
      style={[
        styles.pillContainer,
        {
          backgroundColor: pillBg,
          borderColor: pillBorder,
        },
      ]}>
      <Text style={[styles.pillLabel, { color: pillText }]} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});

export default PremiumSelectorCard;

const styles = StyleSheet.create({
  // Brand chip - Compact premium selector
  brandContainer: {
    width: BRAND_SIZE,
    height: BRAND_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  brandLogoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  brandLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  brandInitial: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  brandLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // Category pill styles - Filter style
  pillContainer: {
    height: PILL_HEIGHT,
    paddingHorizontal: PILL_PADDING,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
