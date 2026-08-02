import React, { memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PressableProps,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type AnimatedPressableProps = PressableProps & {
  style?: ReturnType<typeof useAnimatedStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(
  Pressable,
) as React.ComponentType<AnimatedPressableProps>;

import { Colors } from "@/constants/theme";

/** KREAM-style compact brand chip */
const CHIP_SIZE = 42;

type PremiumSelectorCardProps = {
  id: string;
  label: string;
  imageUrl?: string | null;
  isSelected: boolean;
  onPress: (id: string) => void;
  variant?: "brand" | "category";
};

/** Premium Brand Chip - circular, minimal, scannable */
const PremiumSelectorCard = memo(function PremiumSelectorCard({
  id,
  label,
  imageUrl,
  isSelected,
  onPress,
  variant = "brand",
}: PremiumSelectorCardProps) {
  const isBrand = variant === "brand";
  const selected = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selected.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 200,
      mass: 0.5,
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = selected.value === 1;
    return {
      backgroundColor: withSpring(
        isActive ? Colors.light.card : "transparent",
        {
          damping: 15,
          stiffness: 200,
        },
      ),
      borderColor: withSpring(
        isActive ? Colors.light.text : Colors.light.border,
        {
          damping: 15,
          stiffness: 200,
        },
      ),
      transform: [
        {
          scale: withSpring(isActive ? 1.15 : 1, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
      shadowColor: "#000",
      shadowOffset: { width: 0, height: selected.value === 1 ? 2 : 0 },
      shadowOpacity: withSpring(selected.value === 1 ? 0.08 : 0, {
        damping: 15,
        stiffness: 200,
      }),
      shadowRadius: withSpring(selected.value === 1 ? 4 : 0, {
        damping: 15,
        stiffness: 200,
      }),
      elevation: withSpring(selected.value === 1 ? 2 : 0, {
        damping: 15,
        stiffness: 200,
      }),
    };
  });

  if (isBrand) {
    const isAll = id === "__all__";
    return (
      <AnimatedPressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(id);
        }}
        style={[styles.brandChip, animatedStyle, isAll && styles.brandChipAll]}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}>
        {isAll ? (
          <Text style={styles.allText}>All</Text>
        ) : (
          <Image
            source={{ uri: imageUrl || undefined }}
            style={styles.brandLogo}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={150}
          />
        )}
      </AnimatedPressable>
    );
  }

  // Category pill - theme-aware
  const categoryBg = isSelected
    ? Colors.light.text
    : Colors.light.backgroundSecondary;
  const categoryTextColor = isSelected
    ? Colors.light.card
    : Colors.light.textSecondary;

  return (
    <AnimatedPressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(id);
      }}
      style={[
        styles.categoryPill,
        {
          backgroundColor: categoryBg,
        },
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}>
      <Text
        style={[styles.pillText, { color: categoryTextColor }]}
        numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});

export default PremiumSelectorCard;

const styles = StyleSheet.create({
  // Compact brand chip - circular, border only when selected
  brandChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  brandChipAll: {
    backgroundColor: "transparent",
  },
  brandLogo: {
    width: 24,
    height: 24,
  },
  allText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },

  // Category pill
  categoryPill: {
    height: 32,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 8,
    alignSelf: "center",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
