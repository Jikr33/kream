import React, { memo, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

import PacmanLoader from "./PacmanLoader";
import { Colors } from "@/constants/theme";

export type LoadingOverlayProps = {
  visible: boolean;
  /** Fullscreen (absolute, covers screen) vs inline (fills parent flex). */
  fullscreen?: boolean;
  /** Transparent background (lets content show through) vs solid/dark. */
  transparent?: boolean;
  /** Dark background overlay (use over light content / for focus). */
  dark?: boolean;
  /** Loader size in px. */
  size?: number;
  /** Loader color. */
  color?: string;
  /** Optional loading message rendered below the loader. */
  message?: string;
  /** Minimum visible duration in ms (prevents flicker on fast loads). */
  minDurationMs?: number;
  /** Fade duration in ms. */
  fadeDurationMs?: number;
};

/**
 * LoadingOverlay
 * ==============
 * One reusable loading component for the whole app.
 *
 * - Supports fullscreen (absolute) and inline (flex) modes.
 * - Supports transparent, solid (background), and dark backgrounds.
 * - Fades in/out smoothly.
 * - Implements a minimum visible duration to avoid flicker when loading
 *   finishes within ~200ms.
 * - Extensible: pass a `message` for future loading copy.
 *
 * Usage:
 *   <LoadingOverlay visible={isLoading} fullscreen />
 *   <LoadingOverlay visible={isLoading} inline transparent />
 */
const LoadingOverlay = memo(function LoadingOverlay({
  visible,
  fullscreen = false,
  transparent = false,
  dark = false,
  size = 50,
  color = "#111111",
  message,
  minDurationMs = 200,
  fadeDurationMs = 200,
}: LoadingOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  // Tracks whether the minimum display duration has elapsed.
  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True while we are within the minimum display window.
  const withinMin = useRef(false);

  useEffect(() => {
    if (visible) {
      // Start minimum-duration window
      withinMin.current = true;
      if (minTimer.current) clearTimeout(minTimer.current);
      minTimer.current = setTimeout(() => {
        withinMin.current = false;
      }, minDurationMs);

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: fadeDurationMs,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Only fade out once the minimum duration has elapsed.
      const finishFadeOut = () => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeDurationMs,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start();
      };

      if (withinMin.current) {
        // Wait for the remaining minimum time before fading out.
        if (minTimer.current) clearTimeout(minTimer.current);
        minTimer.current = setTimeout(() => {
          withinMin.current = false;
          finishFadeOut();
        }, minDurationMs);
      } else {
        finishFadeOut();
      }
    }

    return () => {
      if (minTimer.current) {
        clearTimeout(minTimer.current);
        minTimer.current = null;
      }
    };
  }, [visible, opacity, minDurationMs, fadeDurationMs]);

  const backgroundColor = dark
    ? "rgba(0,0,0,0.55)"
    : transparent
      ? "rgba(255,255,255,0)"
      : Colors.light.background;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.overlay,
        fullscreen && styles.fullscreen,
        { backgroundColor, opacity },
      ]}>
      <View style={styles.loaderWrap}>
        <PacmanLoader size={size} color={color} />
        {message ? (
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
});

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
