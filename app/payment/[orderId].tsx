/**
 * @deprecated This route is deprecated.
 * Use /payment?orderId=xxx instead.
 */
import { View, Text } from "react-native";

export default function DeprecatedPaymentScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>This payment route is deprecated.</Text>
      <Text>Please use the new payment flow.</Text>
    </View>
  );
}
