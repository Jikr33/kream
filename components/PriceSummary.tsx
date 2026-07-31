import React, { useState, memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Colors, BorderRadius } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type PriceRow = {
  label: string;
  value: number;
};

type PriceSummaryProps = {
  itemPrice: number;
  shippingFee?: number;
  platformFee?: number;
  discount?: number;
};

const PriceSummary = memo(function PriceSummary({
  itemPrice,
  shippingFee = 0,
  platformFee = 0,
  discount = 0,
}: PriceSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const rows: PriceRow[] = [
    { label: "Item Price", value: itemPrice },
    { label: "Shipping Fee", value: shippingFee },
    { label: "Platform Fee", value: platformFee },
  ];

  if (discount > 0) {
    rows.push({ label: "Discount", value: -discount });
  }

  const total = itemPrice + shippingFee + platformFee - discount;

  return (
    <View style={styles.container}>
      {/* Header - Always visible */}
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.7}>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={styles.headerRight}>
          <Text style={styles.totalAmount}>{total.toLocaleString("mn-MN")}₮</Text>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#6B7280" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && (
        <View style={styles.content}>
          {rows.map((row, index) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={[styles.rowValue, row.value < 0 && styles.discountValue]}>
                {row.value < 0 ? "-" : ""}
                {Math.abs(row.value).toLocaleString("mn-MN")}₮
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString("mn-MN")}₮</Text>
          </View>
        </View>
      )}
    </View>
  );
});

export default PriceSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
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
  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.1,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
  },
});
