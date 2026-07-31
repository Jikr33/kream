import React, { useState, useEffect, memo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
  deliveryInstructions?: string;
};

type AddressBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialAddress?: AddressData | null;
};

const STORAGE_KEY = "guest_checkout_address";

// Storage helper with graceful fallback for web
const storage = {
  async get(key: string): Promise<AddressData | null> {
    try {
      const SecureStore = require("expo-secure-store");
      const data = await SecureStore.getItemAsync(key);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fallback for web
      try {
        const data = global.localStorage?.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }
  },
  async set(key: string, value: AddressData): Promise<void> {
    try {
      const SecureStore = require("expo-secure-store");
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch {
      // Fallback for web
      try {
        global.localStorage?.setItem(key, JSON.stringify(value));
      } catch {
        // Silently fail - address will still be passed to onSave
      }
    }
  },
};

const AddressBottomSheet = memo(function AddressBottomSheet({
  visible,
  onClose,
  onSave,
  initialAddress,
}: AddressBottomSheetProps) {
  const [formData, setFormData] = useState<AddressData>({
    recipientName: "",
    phoneNumber: "",
    email: "",
    country: "Mongolia",
    city: "",
    district: "",
    streetAddress: "",
    postalCode: "",
    deliveryInstructions: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load saved address when visible
  useEffect(() => {
    if (visible) {
      loadSavedAddress();
    }
  }, [visible]);

  const loadSavedAddress = useCallback(async () => {
    try {
      const saved = await storage.get(STORAGE_KEY);
      if (saved) {
        setFormData(saved);
      } else if (initialAddress) {
        setFormData(initialAddress);
      }
    } catch (error) {
      console.error("Failed to load address:", error);
    }
  }, [initialAddress]);

  const updateField = useCallback((field: keyof AddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Name is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await storage.set(STORAGE_KEY, formData);
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSave, onClose, validate]);

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    keyboardType = "default",
    multiline = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    error?: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    multiline?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipping Address</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={isLoading}>
            <Text style={[styles.saveText, isLoading && styles.saveTextDisabled]}>
              {isLoading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <InputField
            label="Recipient Name"
            value={formData.recipientName}
            onChangeText={(v) => updateField("recipientName", v)}
            placeholder="Full name"
            error={errors.recipientName}
          />

          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(v) => updateField("phoneNumber", v)}
            placeholder="+976"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />

          <InputField
            label="Email"
            value={formData.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="email@example.com"
            keyboardType="email-address"
            error={errors.email}
          />

          <InputField
            label="Country"
            value={formData.country}
            onChangeText={(v) => updateField("country", v)}
            placeholder="Country"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <InputField
                label="City"
                value={formData.city}
                onChangeText={(v) => updateField("city", v)}
                placeholder="City"
                error={errors.city}
              />
            </View>
            <View style={styles.halfInput}>
              <InputField
                label="District"
                value={formData.district}
                onChangeText={(v) => updateField("district", v)}
                placeholder="District"
              />
            </View>
          </View>

          <InputField
            label="Street Address"
            value={formData.streetAddress}
            onChangeText={(v) => updateField("streetAddress", v)}
            placeholder="Building, street, unit"
            error={errors.streetAddress}
          />

          <InputField
            label="Postal Code"
            value={formData.postalCode}
            onChangeText={(v) => updateField("postalCode", v)}
            placeholder="Postal code"
            keyboardType="numeric"
          />

          <InputField
            label="Delivery Instructions (Optional)"
            value={formData.deliveryInstructions || ""}
            onChangeText={(v) => updateField("deliveryInstructions", v)}
            placeholder="Gate code, landmarks, etc."
            multiline
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default AddressBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
  },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
    textAlign: "right",
  },
  saveTextDisabled: {
    color: "#D1D5DB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111111",
    letterSpacing: 0.1,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#DC2626",
    letterSpacing: 0.1,
    marginTop: 4,
  },
});
