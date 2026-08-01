import React, { memo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors, BorderRadius, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

export type ShippingMethod = "standard" | "express";

type PriceRow = {
  label: string;
  value: number;
};

type PriceSummaryProps = {
  itemPrice: number;
  shippingFee: number;
  platformFee: number;
  discount?: number;
  selectedShipping: ShippingMethod;
  onShippingChange: (method: ShippingMethod) => void;
  standardFee: number;
  expressFee: number;
};

const PriceSummary = memo(function PriceSummary({
  itemPrice,
  shippingFee,
  platformFee,
  discount = 0,
  selectedShipping,
  onShippingChange,
  standardFee,
  expressFee,
}: PriceSummaryProps) {
  const rows: PriceRow[] = [{ label: "Item Price", value: itemPrice }];

  if (discount > 0) {
    rows.push({ label: "Discount", value: -discount });
  }

  const total = itemPrice + shippingFee - discount;

  const handleShippingSelect = (method: ShippingMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShippingChange(method);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Order Summary</Text>

      <View style={styles.content}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text
              style={[styles.rowValue, row.value < 0 && styles.discountValue]}>
              {row.value < 0 ? "-" : ""}
              {Math.abs(row.value).toLocaleString("mn-MN")}₮
            </Text>
          </View>
        ))}

        {/* Shipping Method Selection */}
        <View style={styles.shippingSection}>
          <Text style={styles.shippingLabel}>Shipping Method</Text>
          <View style={styles.shippingOptions}>
            <TouchableOpacity
              style={[
                styles.shippingOption,
                selectedShipping === "standard" &&
                  styles.shippingOptionSelected,
              ]}
              onPress={() => handleShippingSelect("standard")}
              activeOpacity={0.7}>
              <View style={styles.shippingLeft}>
                <MaterialIcons
                  name="local-shipping"
                  size={20}
                  color={
                    selectedShipping === "standard" ? "#111111" : "#6B7280"
                  }
                />
                <View style={styles.shippingInfo}>
                  <Text
                    style={[
                      styles.shippingTitle,
                      selectedShipping === "standard" &&
                        styles.shippingTitleSelected,
                    ]}>
                    Land Freight
                  </Text>
                  <Text style={styles.shippingDesc}>5–10 business days</Text>
                </View>
              </View>
              <View style={styles.shippingRight}>
                <Text
                  style={[
                    styles.shippingPrice,
                    selectedShipping === "standard" &&
                      styles.shippingPriceSelected,
                  ]}>
                  ₮{standardFee.toLocaleString("mn-MN")}
                </Text>
                {selectedShipping === "standard" && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color="#111111"
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shippingOption,
                selectedShipping === "express" && styles.shippingOptionSelected,
              ]}
              onPress={() => handleShippingSelect("express")}
              activeOpacity={0.7}>
              <View style={styles.shippingLeft}>
                <MaterialIcons
                  name="flight"
                  size={20}
                  color={selectedShipping === "express" ? "#111111" : "#6B7280"}
                />
                <View style={styles.shippingInfo}>
                  <Text
                    style={[
                      styles.shippingTitle,
                      selectedShipping === "express" &&
                        styles.shippingTitleSelected,
                    ]}>
                    Air Freight
                  </Text>
                  <Text style={styles.shippingDesc}>2–4 business days</Text>
                </View>
              </View>
              <View style={styles.shippingRight}>
                <Text
                  style={[
                    styles.shippingPrice,
                    selectedShipping === "express" &&
                      styles.shippingPriceSelected,
                  ]}>
                  ₮{expressFee.toLocaleString("mn-MN")}
                </Text>
                {selectedShipping === "express" && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color="#111111"
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("mn-MN")}₮
          </Text>
        </View>
      </View>
    </View>
  );
});

export default PriceSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.card,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
    marginBottom: 16,
  },
  content: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#111111",
    letterSpacing: 0.1,
  },
  discountValue: {
    color: "#16A34A",
  },
  shippingSection: {
    marginTop: 4,
  },
  shippingLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  shippingOptions: {
    gap: 8,
  },
  shippingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#ECECEC",
  },
  shippingOptionSelected: {
    borderColor: "#111111",
    backgroundColor: "#FAFAF8",
  },
  shippingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  shippingInfo: {
    flex: 1,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  shippingTitleSelected: {
    fontWeight: "700",
  },
  shippingDesc: {
    fontSize: 11,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  shippingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shippingPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  shippingPriceSelected: {
    fontWeight: "700",
  },
  checkBadge: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.8,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
    letterSpacing: 0.2,
  },
});
