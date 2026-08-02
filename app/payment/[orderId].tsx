import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";

import LoadingOverlay from "@/components/LoadingOverlay";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { fetchOrderById } from "@/services/orders";

type PaymentStatus = "loading" | "webview" | "success" | "failed" | "cancelled";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("loading");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [order, setOrder] = useState<{
    id: string;
    product_name: string;
    product_image: string | null;
    selected_size: string;
    selected_color: string;
    quantity: number;
    total_amount: number;
    shipping_name: string;
  } | null>(null);

  // Page fade-in
  const pageOpacity = useRef(new Animated.Value(0)).current;

  // Load order details
  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        const orderData = await fetchOrderById(orderId);
        if (orderData) {
          setOrder({
            id: orderData.id,
            product_name: orderData.product_name || "Product",
            product_image: orderData.product_image || null,
            selected_size: orderData.selected_size || "",
            selected_color: orderData.selected_color || "",
            quantity: orderData.quantity || 1,
            total_amount: orderData.total_amount || 0,
            shipping_name: orderData.shipping_name || "",
          });

          // In real app, fetch checkout URL from payment session
          // For now, simulate success after a delay
          setTimeout(() => {
            setCheckoutUrl("https://wire.com/checkout/mock");
            setPaymentStatus("webview");
          }, 1000);
        } else {
          setPaymentStatus("failed");
        }
      } catch (error) {
        console.error("Failed to load order:", error);
        setPaymentStatus("failed");
      }
    }

    loadOrder();

    // Fade in
    Animated.timing(pageOpacity, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [orderId]);

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url.includes("/payment/success")) {
      setPaymentStatus("success");
    } else if (url.includes("/payment/cancel")) {
      setPaymentStatus("cancelled");
    } else if (url.includes("/payment/failed")) {
      setPaymentStatus("failed");
    }
  };

  const handleDone = useCallback(() => {
    router.push("/(tabs)");
  }, [router]);

  const handleViewOrders = useCallback(() => {
    router.push("/orders");
  }, [router]);

  const handleRetry = useCallback(() => {
    // Retry payment - navigate back to checkout
    router.back();
  }, [router]);

  const handleBackToCheckout = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (paymentStatus === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <LoadingOverlay visible={true} fullscreen size={50} color="#111111" />
      </SafeAreaView>
    );
  }

  // Success state
  if (paymentStatus === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: pageOpacity }}>
          <ScrollView
            contentContainerStyle={styles.successContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
            </View>

            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successSubtitle}>
              Your order has been received.
            </Text>

            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewOrders}
                activeOpacity={0.9}>
                <Text style={styles.primaryButtonText}>View Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleDone}
                activeOpacity={0.9}>
                <Text style={styles.secondaryButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Failed state
  if (paymentStatus === "failed") {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: pageOpacity }}>
          <ScrollView
            contentContainerStyle={styles.failedContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.failedIconContainer}>
              <View style={styles.failedIcon}>
                <Text style={styles.failedIconText}>!</Text>
              </View>
            </View>

            <Text style={styles.failedTitle}>Payment Failed</Text>
            <Text style={styles.failedSubtitle}>
              Your payment could not be completed.
            </Text>

            <View style={styles.failedButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRetry}
                activeOpacity={0.9}>
                <Text style={styles.primaryButtonText}>Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToCheckout}
                activeOpacity={0.9}>
                <Text style={styles.secondaryButtonText}>Back to Checkout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Cancelled state
  if (paymentStatus === "cancelled") {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ flex: 1, opacity: pageOpacity }}>
          <ScrollView
            contentContainerStyle={styles.cancelledContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.cancelledIconContainer}>
              <View style={styles.cancelledIcon}>
                <Text style={styles.cancelledIconText}>×</Text>
              </View>
            </View>

            <Text style={styles.cancelledTitle}>Payment Cancelled</Text>
            <Text style={styles.cancelledSubtitle}>
              Your payment was cancelled.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToCheckout}
              activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Back to Checkout</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // WebView state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webViewContainer}>
        {checkoutUrl ? (
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <LoadingOverlay
                  visible={true}
                  fullscreen
                  size={40}
                  color="#111111"
                />
              </View>
            )}
            style={styles.webView}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load payment</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToCheckout}
              activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Back to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  // Success
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.success,
    justifyContent: "center",
    alignItems: "center",
  },
  successIconText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  successTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    color: Colors.light.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  successSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  // Failed
  failedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  failedIconContainer: {
    marginBottom: Spacing.lg,
  },
  failedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.error,
    justifyContent: "center",
    alignItems: "center",
  },
  failedIconText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  failedTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    color: Colors.light.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  failedSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  // Cancelled
  cancelledContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  cancelledIconContainer: {
    marginBottom: Spacing.lg,
  },
  cancelledIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.textTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelledIconText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelledTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    color: Colors.light.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  cancelledSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  // Buttons
  successButtons: {
    width: "100%",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  failedButtons: {
    width: "100%",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.light.text,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: Colors.light.card,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
});
