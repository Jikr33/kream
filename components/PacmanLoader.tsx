import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

export type PacmanLoaderProps = {
  size?: number;
  color?: string;
};

/**
 * PacmanLoader
 * ============
 * A lightweight, dependency-free Pac-Man loader built with React Native's
 * built-in Animated API (runs on the native thread via useNativeDriver).
 *
 * API matches the spec: <PacmanLoader size={50} color="#111111" />
 *
 * The Pac-Man stays in place while dots travel left and get "eaten".
 * Premium, minimal, on-brand with the near-black aesthetic.
 */
const DOT_COUNT = 4;
const CYCLE_MS = 1000;
const STAGGER_MS = 250;
const MOUTH_OPEN_DEG = 34;
const MOUTH_DURATION_MS = 170;

export default function PacmanLoader({
  size = 50,
  color = "#111111",
}: PacmanLoaderProps) {
  const mouth = useRef(new Animated.Value(0)).current;
  const dots = useRef<Animated.Value[]>(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Mouth open/close loop
    const mouthLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mouth, {
          toValue: 1,
          duration: MOUTH_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(mouth, {
          toValue: 0,
          duration: MOUTH_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    mouthLoop.start();

    // Dot loops, staggered
    const dotLoops = dots.map((dot) =>
      Animated.loop(
        Animated.timing(dot, {
          toValue: 1,
          duration: CYCLE_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    );
    const timers: ReturnType<typeof setTimeout>[] = [];
    dotLoops.forEach((loop, i) => {
      const t = setTimeout(() => loop.start(), i * STAGGER_MS);
      timers.push(t);
    });

    return () => {
      mouthLoop.stop();
      dotLoops.forEach((l) => l.stop());
      timers.forEach(clearTimeout);
    };
  }, [mouth, dots]);

  const half = size / 2;
  const quarter = size / 4;
  const dotSize = Math.max(4, size * 0.13);
  const trackWidth = size * 2.2;

  const upperJawRotate = mouth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `-${MOUTH_OPEN_DEG}deg`],
  });
  const lowerJawRotate = mouth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${MOUTH_OPEN_DEG}deg`],
  });

  return (
    <View
      style={[styles.container, { width: trackWidth + size, height: size }]}
      accessibilityLabel="Loading"
      accessibilityRole="image">
      {/* Pac-Man */}
      <View
        style={[styles.pacman, { width: size, height: size, left: 0, top: 0 }]}>
        {/* Upper jaw */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: half,
              backgroundColor: color,
              borderTopLeftRadius: half,
              borderTopRightRadius: half,
            },
            {
              transform: [
                { translateY: -quarter },
                { rotate: upperJawRotate },
                { translateY: quarter },
              ],
            },
          ]}
        />
        {/* Lower jaw */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: half,
              left: 0,
              width: size,
              height: half,
              backgroundColor: color,
              borderBottomLeftRadius: half,
              borderBottomRightRadius: half,
            },
            {
              transform: [
                { translateY: quarter },
                { rotate: lowerJawRotate },
                { translateY: -quarter },
              ],
            },
          ]}
        />
      </View>

      {/* Dots */}
      {dots.map((dot, i) => {
        const translateX = dot.interpolate({
          inputRange: [0, 1],
          outputRange: [trackWidth, -dotSize],
        });
        const opacity = dot.interpolate({
          inputRange: [0, 0.7, 0.92, 1],
          outputRange: [0, 1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: color,
                top: half - dotSize / 2,
                left: size,
                opacity,
                transform: [{ translateX }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pacman: {
    position: "absolute",
  },
  dot: {
    position: "absolute",
  },
});
