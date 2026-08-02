import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

export type ShippingMethod = "standard" | "express";

export type ShippingMethodSelectorProps = {
  selectedMethod: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
  standardFee: number;
  expressFee: number;
};

const ShippingMethodSelector = memo(function ShippingMethodSelector({
  selectedMethod,
  onSelect,
  standardFee,
  expressFee,
}: ShippingMethodSelectorProps) {
  const methods = [
    {
      id: "standard" as ShippingMethod,
      title: "Land Freight",
      description: "Standard Delivery",
      icon: "local-shipping" as const,
      estimated: "5–10 business days",
      fee: standardFee,
      features: ["Cheaper", "Reliable"],
    },
    {
      id: "express" as ShippingMethod,
      title: "Air Freight",
      description: "Express Delivery",
      icon: "flight" as const,
      estimated: "2–4 business days",
      fee: expressFee,
      features: ["Fastest", "Priority"],
    },
  ];

  return (
    <View style={styles.container}>
      {methods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <TouchableOpacity
            key={method.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(method.id);
            }}
            activeOpacity={0.7}
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${method.title} - ${method.description}`}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={method.icon}
                size={24}
                color={isSelected ? "#111111" : "#6B7280"}
              />
            </View>

            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text
                  style={[styles.title, isSelected && styles.titleSelected]}>
                  {method.title}
                </Text>
                <Text style={styles.estimated}>{method.estimated}</Text>
              </View>

              <Text style={styles.description}>{method.description}</Text>

              <View style={styles.featuresRow}>
                {method.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureChip}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={[styles.price, isSelected && styles.priceSelected]}>
                ₮{method.fee.toLocaleString("mn-MN")}
              </Text>
            </View>

            {isSelected && (
              <View style={styles.checkBadge}>
                <MaterialIcons name="check-circle" size={20} color="#111111" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default ShippingMethodSelector;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#ECECEC",
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: "#111111",
    backgroundColor: "#FAFAF8",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  titleSelected: {
    fontWeight: "700",
  },
  estimated: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    marginBottom: 6,
  },
  featuresRow: {
    flexDirection: "row",
    gap: 6,
  },
  featureChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F5F5F4",
    borderRadius: 4,
  },
  featureText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.2,
  },
  priceContainer: {
    marginLeft: 10,
    alignItems: "flex-end",
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  priceSelected: {
    fontWeight: "700",
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});
