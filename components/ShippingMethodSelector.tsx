import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius } from "@/constants/theme";

export type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "land",
    name: "Land Freight",
    description: "Standard Delivery",
    price: 3500,
    estimatedDays: "5-10 business days",
    icon: "local-shipping",
  },
  {
    id: "air",
    name: "Air Freight",
    description: "Express Delivery",
    price: 8500,
    estimatedDays: "2-4 business days",
    icon: "flight",
  },
];

type ShippingMethodSelectorProps = {
  selectedId: string;
  onSelect: (method: ShippingMethod) => void;
};

const ShippingMethodSelector = memo(function ShippingMethodSelector({
  selectedId,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <View style={styles.container}>
      {SHIPPING_METHODS.map((method) => {
        const isSelected = method.id === selectedId;
        return (
          <TouchableOpacity
            key={method.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(method)}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={method.icon as any}
                size={22}
                color={isSelected ? "#FFFFFF" : "#111111"}
              />
            </View>
            <View style={styles.content}>
              <Text style={[styles.name, isSelected && styles.textSelected]}>
                {method.name}
              </Text>
              <Text style={[styles.description, isSelected && styles.textSelectedSecondary]}>
                {method.description}
              </Text>
              <Text style={[styles.estimated, isSelected && styles.textSelectedSecondary]}>
                {method.estimatedDays}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, isSelected && styles.textSelected]}>
                {method.price.toLocaleString("mn-MN")}₮
              </Text>
              {method.id === "air" && (
                <Text style={styles.priceDifference}>+5,000₮</Text>
              )}
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
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
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  cardSelected: {
    borderColor: "#111111",
    backgroundColor: "#FAFAF8",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
  },
  estimated: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  textSelected: {
    color: "#111111",
  },
  textSelectedSecondary: {
    color: "#6B7280",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  priceDifference: {
    fontSize: 10,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
});
