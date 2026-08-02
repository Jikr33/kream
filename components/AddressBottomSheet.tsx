import React, { memo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius } from "@/constants/theme";

export type AddressData = {
  recipientName: string;
  phoneNumber: string;
  email: string;
  country: string;
  city: string;
  district: string;
  streetAddress: string;
  postalCode: string;
  deliveryInstructions: string;
};

type AddressBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialAddress?: AddressData | null;
  userEmail?: string | null;
};

const EMPTY_ADDRESS: AddressData = {
  recipientName: "",
  phoneNumber: "",
  email: "",
  country: "Mongolia",
  city: "Ulaanbaatar",
  district: "",
  streetAddress: "",
  postalCode: "",
  deliveryInstructions: "",
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

const AddressBottomSheet = memo(function AddressBottomSheet({
  visible,
  onClose,
  onSave,
  initialAddress,
  userEmail,
}: AddressBottomSheetProps) {
  const [address, setAddress] = useState<AddressData>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressData, string>>
  >({});
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      if (initialAddress) {
        setAddress(initialAddress);
      } else {
        setAddress({
          ...EMPTY_ADDRESS,
          email: userEmail || "",
        });
      }
      setErrors({});
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 60,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialAddress, userEmail]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};

    if (!address.recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required";
    }

    if (!address.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!address.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(address.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.district.trim()) {
      newErrors.district = "District is required";
    }

    if (!address.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    if (!address.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [address]);

  const handleSave = useCallback(() => {
    if (validateForm()) {
      onSave(address);
      onClose();
    }
  }, [address, validateForm, onSave, onClose]);

  const updateField = useCallback(
    (field: keyof AddressData, value: string) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BOTTOM_SHEET_HEIGHT, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              height: BOTTOM_SHEET_HEIGHT,
            },
          ]}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.form}>
                <FieldInput
                  label="Recipient Name"
                  value={address.recipientName}
                  onChangeText={(text) => updateField("recipientName", text)}
                  error={errors.recipientName}
                  placeholder="Enter recipient name"
                  autoCapitalize="words"
                />

                <FieldInput
                  label="Phone Number"
                  value={address.phoneNumber}
                  onChangeText={(text) => updateField("phoneNumber", text)}
                  error={errors.phoneNumber}
                  placeholder="+82 10-0000-0000"
                  keyboardType="phone-pad"
                />

                <FieldInput
                  label="Email Address"
                  value={address.email}
                  onChangeText={(text) => updateField("email", text)}
                  error={errors.email}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <FieldInput
                      label="Country"
                      value={address.country}
                      onChangeText={(text) => updateField("country", text)}
                      placeholder="Country"
                      editable={false}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <FieldInput
                      label="City"
                      value={address.city}
                      onChangeText={(text) => updateField("city", text)}
                      error={errors.city}
                      placeholder="City"
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <FieldInput
                  label="District"
                  value={address.district}
                  onChangeText={(text) => updateField("district", text)}
                  error={errors.district}
                  placeholder="District / Khoroo"
                  autoCapitalize="words"
                />

                <FieldInput
                  label="Street Address"
                  value={address.streetAddress}
                  onChangeText={(text) => updateField("streetAddress", text)}
                  error={errors.streetAddress}
                  placeholder="Street, building, apartment"
                  autoCapitalize="sentences"
                />

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <FieldInput
                      label="Postal Code"
                      value={address.postalCode}
                      onChangeText={(text) => updateField("postalCode", text)}
                      error={errors.postalCode}
                      placeholder="00000"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.textAreaContainer}>
                  <Text style={styles.label}>
                    Delivery Instructions (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      errors.deliveryInstructions && styles.inputError,
                    ]}
                    value={address.deliveryInstructions}
                    onChangeText={(text) =>
                      updateField("deliveryInstructions", text)
                    }
                    placeholder="Any special delivery instructions..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.7}>
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
});

type FieldInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  editable?: boolean;
  maxLength?: number;
};

const FieldInput = memo(function FieldInput({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  maxLength,
}: FieldInputProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          !editable && styles.inputDisabled,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default AddressBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldContainer: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "400",
    color: "#111111",
    letterSpacing: 0.1,
    borderWidth: 1,
    borderColor: "#ECECEC",
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: "#F5F5F4",
    color: "#6B7280",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  textAreaContainer: {
    gap: 6,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "400",
    color: "#111111",
    letterSpacing: 0.1,
    borderWidth: 1,
    borderColor: "#ECECEC",
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#DC2626",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ECECEC",
  },
  cancelButton: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  saveButton: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: "#111111",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
