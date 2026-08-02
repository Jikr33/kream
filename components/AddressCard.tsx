import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius, Shadows } from "@/constants/theme";

type AddressCardProps = {
  recipientName: string;
  address: string;
  postalCode?: string;
  phoneNumber?: string;
  onEdit?: () => void;
  onChange?: () => void;
};

const AddressCard = memo(function AddressCard({
  recipientName,
  address,
  postalCode,
  phoneNumber,
  onEdit,
  onChange,
}: AddressCardProps) {
  const hasAddress = !!address;

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="location-on" size={20} color="#6B7280" />
      </View>

      <View style={styles.content}>
        <Text style={styles.recipientName}>{recipientName}</Text>
        {hasAddress ? (
          <>
            <Text style={styles.address}>{address}</Text>
            {postalCode && <Text style={styles.postalCode}>{postalCode}</Text>}
            {phoneNumber && (
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            )}
          </>
        ) : (
          <Text style={styles.noAddress}>No address added</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onEdit || onChange}
        activeOpacity={0.7}>
        <Text style={styles.actionText}>{hasAddress ? "Edit" : "Add"}</Text>
      </TouchableOpacity>
    </View>
  );
});

export default AddressCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.card,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  postalCode: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    marginTop: 2,
  },
  noAddress: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.1,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
});
