/**
 * Payment Screen
 *
 * Displays the Wire hosted checkout in a WebView.
 *
 * Flow:
 * 1. Receive orderId and paymentUrl from route params
 * 2. Show WebView with Wire checkout
 * 3. User completes payment in WebView
 * 4. Webhook updates order status in database
 *
 * IMPORTANT:
 * - NO client-side payment verification
 * - NO polling for status
 * - Webhook is the source of truth
 * - Client only displays the payment URL
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, WebViewNavigation } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors, BorderRadius, Spacing } from "@/constants/theme";

type PaymentState = "loading" | "ready" | "cancelled" | "failed";

export default function PaymentScreen() {
  const router = useRouter();
  const { orderId, paymentUrl } = useLocalSearchParams<{
    orderId: string;
    paymentUrl: string;
  }>();

  const [state, setState] = useState<PaymentState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (state === "ready") {
          handleCancel();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [state]);

  // Initialize payment
  useEffect(() => {
    if (!orderId || !paymentUrl) {
      setErrorMessage("Missing payment information");
      setState("failed");
      return;
    }

    setState("ready");
  }, [orderId, paymentUrl]);

  const handleCancel = useCallback(() => {
    setState("cancelled");
    webViewRef.current?.stopLoading();
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
    if (
      url.includes("status=cancelled") ||
      url.includes("payment_intent.canceled")
    ) {
      setState("cancelled");
      webViewRef.current?.stopLoading();
    } else if (
      url.includes("status=failed") ||
      url.includes("payment_intent.failed")
    ) {
      setState("failed");
      webViewRef.current?.stopLoading();
    }
  }, []);

  // Render loading state
  if (state === "loading" || !paymentUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111111" />
          <Text style={styles.loadingText}>Loading payment...</Text>
        </View>
      </View>
    );
  }

  // Render cancelled state
  if (state === "cancelled") {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
            <MaterialIcons name="cancel" size={48} color="#D97706" />
          </View>

          <Text style={styles.resultTitle}>Payment Cancelled</Text>

          <Text style={styles.resultMessage}>Your payment was cancelled.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>Back to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render failed state
  if (state === "failed") {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}>
            <MaterialIcons name="error-outline" size={48} color="#DC2626" />
          </View>

          <Text style={styles.resultTitle}>Payment Failed</Text>

          <Text style={styles.resultMessage}>
            {errorMessage || "Something went wrong. Please try again."}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoToOrders}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>View Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render WebView for checkout
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
        source={{ uri: paymentUrl }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
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
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
    gap: Spacing.sm,
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
