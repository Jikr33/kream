import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(
  require("react-native").Pressable as React.ComponentType<any>,
);

import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const CARD_SIZE = 72;
const LOGO_HEIGHT = 40;

type PremiumSelectorCardProps = {
  id: string;
  label: string;
  imageUrl?: string | null;
  isSelected: boolean;
  onPress: (id: string) => void;
  noBackground?: boolean;
};

const PremiumSelectorCard = memo(function PremiumSelectorCard({
  id,
  label,
  imageUrl,
  isSelected,
  onPress,
  noBackground = false,
}: PremiumSelectorCardProps) {
  const scale = useSharedValue(1);

  const borderColor = isSelected ? Colors.light.tint : Colors.light.border;
  const labelColor = isSelected
    ? Colors.light.tint
    : Colors.light.textSecondary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(isSelected ? 1.05 : 1, {
      damping: 12,
      stiffness: 300,
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <AnimatedPressable
        onPress={() => onPress(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            borderColor,
            width: CARD_SIZE,
            borderRadius: BorderRadius.md,
            borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
            backgroundColor: noBackground ? "transparent" : Colors.light.card,
          },
        ]}>
        <View style={styles.logoContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.logo, noBackground && styles.logoNoBackground]}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{label.charAt(0)}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.label,
            { color: labelColor },
            isSelected && { fontWeight: "600" as const },
          ]}
          numberOfLines={1}>
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default PremiumSelectorCard;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  logoContainer: {
    height: LOGO_HEIGHT,
    width: CARD_SIZE - Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: LOGO_HEIGHT,
    width: CARD_SIZE - Spacing.md,
  },
  placeholder: {
    height: LOGO_HEIGHT,
    width: CARD_SIZE - Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  logoNoBackground: {
    borderRadius: BorderRadius.sm,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.textTertiary,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
    width: CARD_SIZE - Spacing.md,
    letterSpacing: 0.3,
  },
});
