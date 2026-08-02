/**
 * Payment Screen
 * 
 * Displays the Wire hosted checkout in a WebView.
 * 
 * Responsibilities:
 * - Receive orderId from route params
 * - Request payment session from Edge Function
 * - Show loading state while preparing checkout
 * - Render hosted checkout in WebView
 * - Monitor redirect and handle success/failure/cancel
 * - Display appropriate UI states
 * 
 * IMPORTANT:
 * - NO business logic here - only UI and state management
 * - Payment confirmation comes from webhook, not WebView redirects
 * - WebView is only for displaying the hosted checkout
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, WebViewNavigation } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import {
  createPayment,
  checkPaymentStatus,
  cancelPayment,
  PaymentError,
} from "@/services/payment";
import { loadOrder } from "@/services/orders";
import type { Order } from "@/types";

type PaymentState = 
  | "loading"
  | "ready"
  | "processing"
  | "success"
  | "cancelled"
  | "failed";

export default function PaymentScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const [state, setState] = useState<PaymentState>("loading");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  
  const webViewRef = useRef<WebView>(null);
  const hasStartedPayment = useRef(false);

  // Load payment session
  useEffect(() => {
    if (!orderId) {
      setErrorMessage("Order ID is required");
      setState("failed");
      return;
    }

    loadPaymentSession();
  }, [orderId]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (state === "processing" || state === "ready") {
        handleCancel();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [state]);

  // Poll for payment status updates
  useEffect(() => {
    if (state !== "processing") return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(orderId!);
        
        if (status.status === "paid") {
          clearInterval(pollInterval);
          setState("success");
        } else if (status.status === "failed" || status.status === "cancelled") {
          clearInterval(pollInterval);
          setState(status.status === "cancelled" ? "cancelled" : "failed");
        }
      } catch (error) {
        console.error("[PaymentScreen] Status poll error:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [state, orderId]);

  const loadPaymentSession = async () => {
    try {
      setState("loading");
      setErrorMessage(null);

      // Load order for display
      const orderData = await loadOrder(orderId!);
      if (!orderData) {
        throw new Error("Order not found");
      }
      setOrder(orderData);

      // Create payment session
      const payment = await createPayment(orderId!);
      setCheckoutUrl(payment.checkoutUrl);
      setState("ready");
    } catch (error) {
      console.error("[PaymentScreen] Failed to load payment session:", error);
      
      if (error instanceof PaymentError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to initialize payment. Please try again.");
      }
      setState("failed");
    }
  };

  const handleCancel = useCallback(async () => {
    if (state === "processing") {
      // Payment is in progress, try to cancel
      try {
        await cancelPayment(orderId!);
      } catch (error) {
        console.error("[PaymentScreen] Cancel error:", error);
      }
    }
    
    setState("cancelled");
    webViewRef.current?.stopLoading();
  }, [state, orderId]);

  const handleRetry = useCallback(() => {
    setState("loading");
    setErrorMessage(null);
    loadPaymentSession();
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoToOrders = useCallback(() => {
    router.replace("/orders");
  }, [router]);

  // Handle WebView navigation
  const handleNavigation = useCallback((event: WebViewNavigation) => {
    const { url } = event;

    // Detect if user has returned from Wire checkout
    // Wire may redirect to success/cancel URLs
    if (url.includes("status=success") || url.includes("payment_intent.succeeded")) {
      // Don't mark as success here - webhook will update the status
      // Just stop loading and show processing state
      setState("processing");
      webViewRef.current?.stopLoading();
    } else if (url.includes("status=cancelled") || url.includes("payment_intent.canceled")) {
      setState("cancelled");
      webViewRef.current?.stopLoading();
    } else if (url.includes("status=failed") || url.includes("payment_intent.failed")) {
      setState("failed");
      webViewRef.current?.stopLoading();
    }
  }, []);

  // Render loading state
  if (state === "loading") {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111111" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (state === "failed" || state === "cancelled") {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: state === "failed" ? "#FEE2E2" : "#FEF3C7" }
          ]}>
            <MaterialIcons
              name={state === "failed" ? "error-outline" : "cancel"}
              size={48}
              color={state === "failed" ? "#DC2626" : "#D97706"}
            />
          </View>
          
          <Text style={styles.resultTitle}>
            {state === "failed" ? "Payment Failed" : "Payment Cancelled"}
          </Text>
          
          <Text style={styles.resultMessage}>
            {errorMessage || 
              (state === "cancelled" 
                ? "Your payment was cancelled."
                : "Something went wrong. Please try again.")}
          </Text>

          {order && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Order Total</Text>
              <Text style={styles.orderAmount}>
                ₮{order.total_amount.toLocaleString("mn-MN")}
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {state === "failed" && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}>
                <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={state === "cancelled" ? handleGoBack : handleGoToOrders}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>
                {state === "cancelled" ? "Back to Checkout" : "View Orders"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render success state
  if (state === "success") {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}>
            <MaterialIcons name="check-circle" size={48} color="#059669" />
          </View>
          
          <Text style={styles.resultTitle}>Payment Successful!</Text>
          
          <Text style={styles.resultMessage}>
            Your order is being processed. You will receive a confirmation email shortly.
          </Text>

          {order && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Order Total</Text>
              <Text style={styles.orderAmount}>
                ₮{order.total_amount.toLocaleString("mn-MN")}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.viewOrdersButton}
            onPress={handleGoToOrders}
            activeOpacity={0.8}>
            <Text style={styles.viewOrdersButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render processing state
  if (state === "processing") {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={styles.processingIcon}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          
          <Text style={styles.resultTitle}>Verifying Payment...</Text>
          
          <Text style={styles.resultMessage}>
            Please wait while we verify your payment. This may take a moment.
          </Text>

          {order && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Order Total</Text>
              <Text style={styles.orderAmount}>
                ₮{order.total_amount.toLocaleString("mn-MN")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Render WebView for checkout
  if (state === "ready" && checkoutUrl) {
    return (
      <View style={styles.webviewContainer}>
        {/* Header */}
        <View style={styles.webviewHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
            activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigation}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color="#111111" />
              <Text style={styles.webviewLoadingText}>Loading checkout...</Text>
            </View>
          )}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
        />
      </View>
    );
  }

  // Fallback
  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Something went wrong</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  orderInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
    width: "100%",
    maxWidth: 200,
  },
  orderLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
    gap: Spacing.sm,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111111",
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  viewOrdersButton: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: "#111111",
    width: "100%",
    maxWidth: 280,
  },
  viewOrdersButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingTop: Platform.OS === "ios" ? 50 : Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  webviewTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: Spacing.md,
  },
  webviewLoadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
});
