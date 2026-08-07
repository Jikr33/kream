/**
 * Orders Screen
 *
 * Displays user's order history.
 * Uses the orders service for data loading.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { supabase } from "@/supabase";
import { loadUserOrders } from "@/services/orders";
import { formatOrderStatus, getStatusColor } from "@/utils/order";
import type { Order } from "@/types/order";

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setError(null);

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Load orders for this user
      const userOrders = await loadUserOrders(session.user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error("[OrdersScreen] Failed to load orders:", err);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadOrders();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOrderDisplayStatus = (order: Order) => {
    return formatOrderStatus(order.status);
  };

  const getBadgeColor = (order: Order) => {
    return getStatusColor(order.status);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111111" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111111"
          />
        }>
        {error ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={48} color="#9CA3AF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace("/(tabs)/explore")}>
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.7}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>
                    Order: {order.id.slice(0, 8)}...
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getBadgeColor(order) },
                  ]}>
                  <Text style={styles.statusText}>
                    {getOrderDisplayStatus(order)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDivider} />

              <View style={styles.orderProduct}>
                <Text style={styles.productName} numberOfLines={1}>
                  {order.product_snapshot.name}
                </Text>
                <Text style={styles.productDetails}>
                  {order.selected_size} / {order.selected_color} / x
                  {order.quantity}
                </Text>
              </View>

              <View style={styles.orderDivider} />

              <View style={styles.orderContent}>
                <Text style={styles.orderItems}>
                  {order.quantity} item
                  {order.quantity > 1 ? "s" : ""}
                </Text>
                <Text style={styles.orderTotal}>
                  ₮{order.total.toLocaleString("mn-MN")}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.body.fontWeight,
  },
  errorText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.error,
    fontWeight: Typography.body.fontWeight,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  retryButtonText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
    fontWeight: "500",
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
    paddingVertical: 4,
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
  orderProduct: {
    marginBottom: Spacing.xs,
  },
  productName: {
    fontSize: Typography.body.fontSize,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  productDetails: {
    fontSize: Typography.caption.fontSize,
    color: Colors.light.textSecondary,
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
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
});
