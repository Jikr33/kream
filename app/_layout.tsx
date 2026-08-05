import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import { Colors } from "@/constants/theme";
import { loadAddressFromStorage } from "@/store/address";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useEffect(() => {
    loadAddressFromStorage();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          // Premium, smooth transitions — no abrupt white flashes.
          animation: "fade",
          animationDuration: 200,
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sneaker/[id]"
          options={{
            title: "Product Details",
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            headerShown: false,
            animation: "fade",
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            animation: "fade",
            animationDuration: 200,
          }}
        />
      </Stack>
    </>
  );
}
