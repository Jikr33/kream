import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";

export default function OrdersScreen() {
  const router = useRouter();

  const orders = [
    {
      id: "order-1",
      total: 265000,
      status: "delivered",
      date: "2024-06-15",
      items: 2,
    },
    {
      id: "order-2",
      total: 85000,
      status: "shipped",
      date: "2024-06-28",
      items: 1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return Colors.light.success;
      case "shipped":
        return Colors.light.tint;
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return Colors.light.error;
      default:
        return Colors.light.textTertiary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace("/(tabs)/explore")}>
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order: {order.id}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.orderDivider} />

              <View style={styles.orderContent}>
                <Text style={styles.orderItems}>{order.items} items</Text>
                <Text style={styles.orderTotal}>
                  {order.total.toLocaleString("mn-MN")}₮
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.body.fontWeight,
  },
  shopButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: Spacing.lg + 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  shopButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: "#fff",
    letterSpacing: 0.3,
  },
  orderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.light.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textTertiary,
    fontWeight: Typography.caption.fontWeight,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.caption.fontSize - 1,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.sm,
  },
  orderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItems: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
  },
  orderTotal: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
  },
});
