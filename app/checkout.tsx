import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

import CheckoutProductCard from "@/components/CheckoutProductCard";
import PriceSummary from "@/components/PriceSummary";
import AddressCard from "@/components/AddressCard";
import PaymentMethodRow, {
  PAYMENT_METHODS,
} from "@/components/PaymentMethodRow";
import SecurityCard from "@/components/SecurityCard";
import StickyCheckoutButton from "@/components/StickyCheckoutButton";
import { ShippingMethod } from "@/components/PriceSummary";
import AddressBottomSheet, {
  AddressData,
} from "@/components/AddressBottomSheet";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getGuestAddress,
  saveGuestAddress,
  getCart,
  saveCart,
  clearCart,
  clearGuestAddress,
} from "@/utils/storage";
import { supabase } from "@/supabase";
import { getBrandName } from "@/constants/brands";

type ProductVariant = {
  size: string;
  color: string;
  quantity: number;
  availableSizes: string[];
  availableColors: { name: string; value: string }[];
  maxStock: number;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string>("credit-card");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();

  // Order state with product options
  const [product, setProduct] = useState({
    brand_id: "nike",
    name: "Air Force 1 Low",
    price: 120000,
    thumb: null as string | null,
  });

  const [variant, setVariant] = useState<ProductVariant>({
    size: "10",
    color: "Default",
    quantity: 1,
    availableSizes: ["7", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
    availableColors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Grey", value: "#9CA3AF" },
    ],
    maxStock: 5,
  });

  const [address, setAddress] = useState<AddressData | null>(null);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard");

  // Shipping fees
  const standardShippingFee = 3500;
  const expressShippingFee = 8500;

  // Calculate totals
  const shippingFee = useMemo(
    () =>
      shippingMethod === "standard" ? standardShippingFee : expressShippingFee,
    [shippingMethod],
  );
  const platformFee = useMemo(
    () => Math.round(product.price * variant.quantity * 0.03),
    [product.price, variant.quantity],
  );
  const total = useMemo(
    () => product.price * variant.quantity + shippingFee + platformFee,
    [product.price, variant.quantity, shippingFee, platformFee],
  );

  const brandName = getBrandName(product.brand_id);
  const productName = product.name;
  const imageUrl = product.thumb;

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Mark as initialized after first load
  useEffect(() => {
    console.log(id, "checkout!!!!");
    if (!isInitialized && address && brandName) {
      setIsInitialized(true);
    }
  }, [address, brandName, isInitialized]);

  const loadSavedData = async () => {
    try {
      // Load guest address first
      const savedAddress = await getGuestAddress();
      if (savedAddress) {
        setAddress(savedAddress);
      }

      // Load cart
      const savedCart = await getCart();
      if (savedCart) {
        if (savedCart.product) setProduct(savedCart.product);
        if (savedCart.variant) setVariant(savedCart.variant);
        if (savedCart.shippingMethod)
          setShippingMethod(savedCart.shippingMethod);
      }

      // Check if user is logged in
      // TODO: Replace with actual Supabase auth check
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        // Load user's saved address from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("address")
          .eq("id", session.user.id)
          .single();

        if ((profile as any)?.address && !savedAddress) {
          setAddress((profile as any).address);
        }
      }
    } catch (error) {
      console.error("[Checkout] Failed to load saved data:", error);
    }
  };

  // Save cart whenever it changes
  useEffect(() => {
    saveCart({ product, variant, shippingMethod });
  }, [product, variant, shippingMethod]);

  const handleSizeSelect = useCallback((size: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVariant((prev) => ({ ...prev, size }));
  }, []);

  const handleColorSelect = useCallback(
    (color: { name: string; value: string }) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setVariant((prev) => ({ ...prev, color: color.name }));
    },
    [],
  );

  const handleQuantityChange = useCallback(
    (delta: number) => {
      const newQuantity = variant.quantity + delta;
      if (newQuantity >= 1 && newQuantity <= variant.maxStock) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVariant((prev) => ({ ...prev, quantity: newQuantity }));
      }
    },
    [variant.quantity, variant.maxStock],
  );

  const handleShippingMethodChange = useCallback((method: ShippingMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShippingMethod(method);
  }, []);

  const handleAddressSave = useCallback(
    async (newAddress: AddressData) => {
      setAddress(newAddress);
      await saveGuestAddress(newAddress);

      // If user is logged in, also save to Supabase
      if (userEmail) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await supabase.from("profiles").upsert({
              id: session.user.id,
              address: newAddress,
              updated_at: new Date().toISOString(),
            } as any);
          }
        } catch (error) {
          console.error("[Checkout] Failed to sync address to profile:", error);
        }
      }
    },
    [userEmail],
  );

  const handleEditAddress = useCallback(() => {
    setShowAddressSheet(true);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleCheckout = useCallback(async () => {
    if (!address) {
      setShowAddressSheet(true);
      return;
    }

    if (!userEmail && !address.email) {
      alert("Please provide an email address for order confirmation.");
      setShowAddressSheet(true);
      return;
    }

    setIsLoading(true);
    try {
      // Create order in Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const orderData = {
        user_id: session?.user?.id || null,
        sneaker_id: product.brand_id + "-" + product.name,
        quantity: variant.quantity,
        size: variant.size,
        color: variant.color,
        total_amount: total,
        shipping_method: shippingMethod,
        shipping_address: address,
        payment_method: selectedPayment,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // In real app, insert to Supabase
      // const { data: order, error } = await supabase
      //   .from("orders")
      //   .insert([orderData as any])
      //   .select()
      //   .single();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear cart after successful order
      await clearCart();
      await clearGuestAddress();

      // Show success and navigate
      alert("Payment successful! Order placed successfully.");
      router.push("/(tabs)/profile");
    } catch (error) {
      console.error("[Checkout] Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    product,
    variant,
    shippingMethod,
    selectedPayment,
    total,
    userEmail,
    router,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Compact Unified Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#111111" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={styles.headerSubtitleRow}>
              <MaterialIcons name="lock" size={10} color="#9CA3AF" />
              <Text style={styles.headerSubtitle}>Secure Checkout</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Order Card with Product Options */}
          <View style={styles.section}>
            <CheckoutProductCard
              brandName={brandName}
              productName={productName}
              color={variant.color}
              size={variant.size}
              quantity={variant.quantity}
              price={product.price}
              imageUrl={imageUrl}
              onSizeSelect={handleSizeSelect}
              onColorSelect={handleColorSelect}
              onQuantityChange={handleQuantityChange}
            />
          </View>

          {/* Always Expanded Price Summary with Integrated Shipping */}
          <View style={styles.section}>
            <PriceSummary
              itemPrice={product.price * variant.quantity}
              shippingFee={shippingFee}
              platformFee={platformFee}
              selectedShipping={shippingMethod}
              onShippingChange={handleShippingMethodChange}
              standardFee={standardShippingFee}
              expressFee={expressShippingFee}
            />
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <AddressCard
              recipientName={address?.recipientName || ""}
              address={
                address
                  ? `${address.streetAddress}, ${address.district}, ${address.city}`
                  : ""
              }
              postalCode={address?.postalCode}
              phoneNumber={address?.phoneNumber}
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
          disabled={!address}
        />

        {/* Address Bottom Sheet */}
        <AddressBottomSheet
          visible={showAddressSheet}
          onClose={() => setShowAddressSheet(false)}
          onSave={handleAddressSave}
          initialAddress={address}
          userEmail={userEmail}
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
    paddingVertical: 10,
    backgroundColor: "#FAFAF8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
    minHeight: 52,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
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
