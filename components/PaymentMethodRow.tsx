import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius } from "@/constants/theme";

type PaymentMethod = {
  id: string;
  name: string;
  icon?: string;
  logoUrl?: string;
};

type PaymentMethodRowProps = {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
};

const PaymentMethodRow = memo(function PaymentMethodRow({
  method,
  isSelected,
  onSelect,
}: PaymentMethodRowProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onSelect}
      activeOpacity={0.7}>
      {/* Radio Button */}
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        {method.logoUrl ? (
          <Image source={{ uri: method.logoUrl }} style={styles.logo} />
        ) : (
          <MaterialIcons
            name={getIconName(method.icon || method.id)}
            size={22}
            color="#111111"
          />
        )}
      </View>

      {/* Name */}
      <Text style={[styles.name, isSelected && styles.nameSelected]}>
        {method.name}
      </Text>

      {/* Checkmark */}
      {isSelected && (
        <MaterialIcons name="check" size={20} color="#111111" />
      )}
    </TouchableOpacity>
  );
});

function getIconName(id: string): string {
  const iconMap: Record<string, string> = {
    "credit-card": "credit-card",
    "kakaopay": "payment",
    "toss": "payments",
    "bank-transfer": "account-balance",
    "apple-pay": "apple",
    "google-pay": "google",
  };
  return iconMap[id] || "payment";
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "credit-card", name: "Credit / Debit Card" },
  { id: "kakaopay", name: "KakaoPay" },
  { id: "toss", name: "Toss Pay" },
  { id: "bank-transfer", name: "Bank Transfer" },
];

export default PaymentMethodRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  containerSelected: {
    borderColor: "#111111",
    backgroundColor: "#FAFAF8",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioSelected: {
    borderColor: "#111111",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111111",
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
  nameSelected: {
    fontWeight: "600",
  },
});
