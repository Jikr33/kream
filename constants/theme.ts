/**
 * Kream Outlet – Premium Minimal Design System
 * ============================================
 * Inspired by KREAM, Apple Store, COS, MUJI, GOAT, Aesop.
 * Luxurious, calm, effortless, fashion-oriented aesthetic.
 */

import { Platform } from "react-native";

/**
 * Premium Color Palette
 * - Warmer whites for sophistication
 * - Near-black for premium feel
 * - Minimal borders
 * - Extremely subtle shadows
 */
export const Colors = {
  light: {
    // Base
    background: "#FAFAF8", // Primary background - warmer white
    backgroundSecondary: "#F5F5F4", // Secondary background
    card: "#FFFFFF", // Cards - pure white

    // Text
    text: "#111111", // Primary text - near black
    textSecondary: "#6B7280", // Secondary text - medium grey
    textTertiary: "#9CA3AF", // Tertiary text - light grey

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
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    background: "#111111",
    backgroundSecondary: "#1A1A1A",
    card: "#1F1F1F",

    text: "#FAFAFA",
    textSecondary: "#9CA3AF",
    textTertiary: "#6B7280",

    border: "#2D2D2D",
    borderLight: "#262626",

    tint: "#FAFAFA",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#FAFAFA",

    error: "#EF4444",
    success: "#22C55E",

    overlay: "rgba(0,0,0,0.6)",
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

/**
 * Typography Scale
 * Title: 34 Bold
 * Section titles: 20-22 Bold
 * Product Name: 15-16 Semibold
 * Price: 17-18 Bold
 * Brand: 11-12 Medium
 * Secondary text: 11-12 Regular
 */
export const Typography = {
  title: {
    fontSize: 34,
    fontWeight: "700" as const,
    lineHeight: 42,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  price: {
    fontSize: 17,
    fontWeight: "700" as const,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  brand: {
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 11,
    fontWeight: "400" as const,
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  search: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
} as const;

/** Spacing scale – 8pt grid for premium feel */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 28, // Between major sections
} as const;

/** Border radius scale */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

/** Extremely subtle shadows - no blue, no dark */
export const Shadows = {
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 0,
  },
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
} as const;
