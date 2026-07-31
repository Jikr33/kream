import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const SecurityCard = memo(function SecurityCard() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="verified-user" size={18} color="#6B7280" />
      <View style={styles.content}>
        <Text style={styles.title}>Secure & Trusted</Text>
        <Text style={styles.description}>
          Payment information is encrypted and securely processed.
        </Text>
      </View>
    </View>
  );
});

export default SecurityCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.2,
    lineHeight: 15,
  },
});
