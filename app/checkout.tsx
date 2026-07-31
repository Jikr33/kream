import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import CheckoutProductCard from "@/components/CheckoutProductCard";
import PriceSummary from "@/components/PriceSummary";
import AddressCard from "@/components/AddressCard";
import PaymentMethodRow, { PAYMENT_METHODS } from "@/components/PaymentMethodRow";
import SecurityCard from "@/components/SecurityCard";
import StickyCheckoutButton from "@/components/StickyCheckoutButton";
import { Colors, Spacing } from "@/constants/theme";

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string>("credit-card");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from cart/state management
  const order = {
    brandName: "Nike",
    productName: "Air Force 1 Low",
    color: "White",
    size: "10",
    quantity: 1,
    price: 120000,
    imageUrl: null,
  };

  const address = {
    recipientName: "John Doe",
    address: "123 Seoul Street, Gangnam-gu",
    postalCode: "06000",
    phoneNumber: "+82 10-1234-5678",
  };

  const shippingFee = 3500;
  const platformFee = Math.round(order.price * 0.03);
  const total = order.price + shippingFee + platformFee;

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // In real app, handle payment and navigate to success page
    alert("Payment successful! Order placed.");
    router.push("/(tabs)/profile");
  }, [router]);

  const handleBack = () => {
    router.back();
  };

  const handleEditAddress = () => {
    // Navigate to address edit screen
    alert("Address editing would open here");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#111111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              Review your order and complete payment
            </Text>
          </View>
          <View style={styles.secureIndicator}>
            <MaterialIcons name="lock" size={12} color="#9CA3AF" />
            <Text style={styles.secureText}>Secure</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Order Summary Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order</Text>
            <CheckoutProductCard
              brandName={order.brandName}
              productName={order.productName}
              color={order.color}
              size={order.size}
              quantity={order.quantity}
              price={order.price}
              imageUrl={order.imageUrl}
            />
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <PriceSummary
              itemPrice={order.price}
              shippingFee={shippingFee}
              platformFee={platformFee}
            />
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <AddressCard
              recipientName={address.recipientName}
              address={address.address}
              postalCode={address.postalCode}
              phoneNumber={address.phoneNumber}
              onEdit={handleEditAddress}
            />
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodRow
                key={method.id}
                method={method}
                isSelected={selectedPayment === method.id}
                onSelect={() => setSelectedPayment(method.id)}
              />
            ))}
          </View>

          {/* Security */}
          <View style={styles.section}>
            <SecurityCard />
          </View>

          {/* Bottom spacing for sticky button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Sticky Checkout Button */}
        <StickyCheckoutButton
          amount={total}
          onPress={handleCheckout}
          loading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFAF8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  secureIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secureText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});
