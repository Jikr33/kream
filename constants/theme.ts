/**
 * Kream Outlet – Premium Minimal Design System
 * ============================================
 * Inspired by KREAM, Apple Store, COS, MUJI, Nothing, Arc Browser.
 * Luxurious, quiet, mature, effortless aesthetic.
 */

import { Platform } from "react-native";

/** Primary brand color: #111111 (black) for active states and emphasis */
export const Colors = {
  light: {
    // Base
    background: "#FAFAFA", // Primary background
    backgroundSecondary: "#F5F5F5", // Secondary background
    card: "#FFFFFF", // Cards

    // Text
    text: "#111111", // Primary text
    textSecondary: "#6B7280", // Secondary text
    textTertiary: "#9CA3AF", // Tertiary text

    // Borders & Dividers
    border: "#ECECEC", // Borders
    borderLight: "#F3F4F6", // Very light borders

    // Accent
    tint: "#111111", // Active/accent color
    icon: "#6B7280", // Default icon color
    tabIconDefault: "#9CA3AF", // Tab icon default
    tabIconSelected: "#111111", // Tab icon selected

    // Semantic
    error: "#DC2626",
    success: "#16A34A",

    // Overlay
    overlay: "rgba(0,0,0,0.5)",
  },
  dark: {
    // Keep dark mode minimal (optional, use sparingly)
    background: "#111111",
    backgroundSecondary: "#1A1A1A",
    card: "#1A1A1A",

    text: "#FAFAFA",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",

    border: "#2D2D2D",
    borderLight: "#1F1F1F",

    tint: "#FAFAFA",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#FAFAFA",

    error: "#EF4444",
    success: "#22C55E",

    overlay: "rgba(0,0,0,0.7)",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/** Typography scale – minimal, refined */
export const Typography = {
  heading: {
    fontSize: 28,
    fontWeight: "800" as const,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  price: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
} as const;

/** Spacing scale – 4px grid */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Border radius scale */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 20,
  full: 999,
} as const;

/** Shadow scale – very subtle for premium feel */
export const Shadows = {
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
