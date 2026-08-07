/**
 * Checkout Screen
 *
 * Handles the checkout flow:
 * 1. Display order summary
 * 2. Collect shipping address
 * 3. Select shipping method
 * 4. Create order (pending_payment status)
 * 5. Navigate to payment screen
 *
 * IMPORTANT:
 * - This screen ONLY creates the order
 * - Payment is handled by the payment screen
 * - Order status is updated by the webhook
 */

import {
  getAddress,
  setAddress as setGlobalAddress,
  clearAddress,
  loadAddressFromStorage,
  type UserAddress,
} from "@/store/address";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getCart,
  saveCart,
  clearCart,
  clearGuestAddress,
  type CheckoutCart,
} from "@/utils/storage";
import { supabase } from "@/lib/supabase";
import { getBrandName } from "@/constants/brands";
import { createOrder, OrderError } from "@/services/orders";

// ============================================
// Payment (Direct Edge Function Call)
// ============================================

interface CreatePaymentResponse {
  checkoutUrl: string;
  paymentIntentId: string;
  expiresAt: number;
}

async function createPayment(
  orderId: string,
  operatorIds: string[] = ["sandbox"],
): Promise<CreatePaymentResponse> {
  const { data, error } = await supabase.functions.invoke(
    "create-wire-payment",
    {
      body: {
        order_id: orderId,
        operator_ids: operatorIds,
      },
    },
  );

  if (error) {
    console.error("[Checkout] createPayment error:", error);
    throw new Error(error.message || "Failed to create payment");
  }

  if (!data?.checkoutUrl || !data?.paymentIntentId) {
    throw new Error("Invalid response from payment service");
  }

  return {
    checkoutUrl: data.checkoutUrl,
    paymentIntentId: data.paymentIntentId,
    expiresAt: data.expiresAt,
  };
}

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
  const params = useLocalSearchParams<{
    id?: string;
    productName?: string;
    selectedSize?: string;
    selectedColor?: string;
    imageUrl?: string;
    price?: string;
  }>();

  const [selectedPayment, setSelectedPayment] = useState<string>("credit-card");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // If params are provided (from product page), use them directly
  const hasParams = !!(params.id && params.productName && params.price);

  // Order state with product options
  const [product, setProduct] = useState({
    brand_id: "nike",
    name: "Air Force 1 Low",
    price: 120000,
    thumb: null as string | null,
    id: "default-product",
  });

  const [variant, setVariant] = useState<ProductVariant>({
    size: params.selectedSize || "10",
    color: params.selectedColor || "Default",
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

  // Ref to prevent double submission
  const isSubmitting = useRef(false);

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
    if (!isInitialized && address && brandName) {
      setIsInitialized(true);
    }
  }, [address, brandName, isInitialized]);

  const loadSavedData = useCallback(async () => {
    try {
      await loadAddressFromStorage();
      const globalAddressData = getAddress();
      if (globalAddressData) {
        setAddress({
          recipientName: globalAddressData.name,
          phoneNumber: globalAddressData.phone,
          email: globalAddressData.email,
          country: "Mongolia",
          city: globalAddressData.city,
          district: globalAddressData.district,
          streetAddress: globalAddressData.street,
          postalCode: globalAddressData.postalCode || "",
          deliveryInstructions: globalAddressData.deliveryInstructions,
        });
      }

      // Load cart
      const savedCart = await getCart();
      if (savedCart && "product" in savedCart) {
        const checkoutCart = savedCart as CheckoutCart;
        if (checkoutCart.product)
          setProduct((prev) => ({ ...prev, ...checkoutCart.product }));
        if (checkoutCart.variant) setVariant(checkoutCart.variant);
        if (checkoutCart.shippingMethod)
          setShippingMethod(checkoutCart.shippingMethod);
      }

      // Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    } catch (error) {
      console.error("[Checkout] Failed to load saved data:", error);
    }
  }, []);

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

      const userAddress: UserAddress = {
        name: newAddress.recipientName,
        phone: newAddress.phoneNumber,
        email: newAddress.email,
        city: newAddress.city,
        district: newAddress.district,
        street: newAddress.streetAddress,
        postalCode: newAddress.postalCode || undefined,
        deliveryInstructions: newAddress.deliveryInstructions,
      };
      setGlobalAddress(userAddress);

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
    // Prevent double submission
    if (isSubmitting.current || isLoading) {
      return;
    }

    // Read current address at call time to avoid stale closure
    const currentAddress = getAddress();
    const displayAddress = currentAddress
      ? {
          name: currentAddress.name,
          phone: currentAddress.phone,
          email: currentAddress.email,
          city: currentAddress.city,
          district: currentAddress.district,
          street: currentAddress.street,
          postalCode: currentAddress.postalCode || "",
          deliveryInstructions: currentAddress.deliveryInstructions,
        }
      : address
        ? {
            name: address.recipientName,
            phone: address.phoneNumber,
            email: address.email,
            city: address.city,
            district: address.district,
            street: address.streetAddress,
            postalCode: address.postalCode || "",
            deliveryInstructions: address.deliveryInstructions,
          }
        : null;

    if (!displayAddress) {
      setShowAddressSheet(true);
      return;
    }

    if (!userEmail && !displayAddress.email) {
      Alert.alert(
        "Email Required",
        "Please provide an email address for order confirmation.",
      );
      setShowAddressSheet(true);
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);

    try {
      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      // Create order via Edge Function (server-side validation and price calculation)
      const response = await supabase.functions.invoke("create-order", {
        body: {
          productId: product.id,
          selectedSize: variant.size,
          selectedColor: variant.color,
          quantity: variant.quantity,
          shippingMethod,
          shippingAddress: displayAddress,
        },
      });

      if (response.error || !response.data?.success) {
        const errorMessage =
          response.error?.message ||
          response.data?.error?.message ||
          "Failed to create order";
        const errorCode = response.data?.error?.code || "ORDER_CREATE_FAILED";
        throw new OrderError(
          errorMessage,
          errorCode,
          response.data?.error?.statusCode || 400,
        );
      }

      const order = response.data.order;

      // Clear cart after creating order
      await clearCart();
      await clearGuestAddress();

      // Create payment session via Edge Function
      const payment = await createPayment(order.id);

      // Navigate to payment screen with order ID and payment URL
      router.push(
        `/payment?orderId=${order.id}&paymentUrl=${encodeURIComponent(payment.checkoutUrl)}`,
      );
    } catch (error) {
      console.error("[Checkout] Order creation failed:", error);

      if (error instanceof OrderError) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to create order. Please try again.");
      }
    } finally {
      setIsLoading(false);
      // Reset double-submit prevention after a delay
      setTimeout(() => {
        isSubmitting.current = false;
      }, 1000);
    }
  }, [isLoading, userEmail, product, variant, shippingMethod, address, router]);

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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRight}>
            <MaterialIcons name="lock" size={12} color="#9CA3AF" />
            <Text style={styles.headerSubtitle}>Secure Checkout</Text>
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
          disabled={!address || isLoading}
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
    backgroundColor: "#F8F7F4",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8F7F4",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 100,
    justifyContent: "flex-end",
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
