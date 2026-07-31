import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions, AccessibilityInfo } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type AnimatedMongoliaBackgroundProps = {
  scrollY?: SharedValue<number>;
  containerHeight?: number;
};

export default function AnimatedMongoliaBackground({
  scrollY,
  containerHeight = SCREEN_HEIGHT * 4,
}: AnimatedMongoliaBackgroundProps) {
  const reduceMotion = useSharedValue(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.value = enabled;
    });
  }, []);

  useEffect(() => {
    if (!scrollY) return;
    const id = setInterval(() => {
      const p = Math.min(
        Math.max(scrollY.value / (containerHeight * 0.35), 0),
        1,
      );
      progress.value = reduceMotion.value ? 0 : p;
    }, 16);
    return () => clearInterval(id);
  }, [scrollY, containerHeight]);

  const layer1 = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.25, 0.5],
      [1, 0.85, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      progress.value,
      [0, 0.5],
      [1, 1.08],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0, 0.5],
      [0, -SCREEN_HEIGHT * 0.12],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ scale }, { translateY }] };
  });

  const layer2 = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.1, 0.3, 0.6, 0.9],
      [0, 0.85, 0.65, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0.2, 0.8],
      [SCREEN_HEIGHT * 0.05, -SCREEN_HEIGHT * 0.08],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const layer3 = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.45, 0.65, 0.85],
      [0, 0.75, 0.4],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0.4, 0.9],
      [SCREEN_HEIGHT * 0.03, -SCREEN_HEIGHT * 0.05],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const layer4 = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.65, 0.85, 1],
      [0, 0.7, 0.4],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      progress.value,
      [0.6, 1],
      [SCREEN_HEIGHT * 0.02, -SCREEN_HEIGHT * 0.03],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const outlines = useMemo(() => {
    return [
      { w: 180, h: 220, br: 90, topPct: 14, leftPct: 10 },
      { w: 150, h: 190, br: 78, topPct: 18, leftPct: 18 },
      { w: 120, h: 160, br: 66, topPct: 22, leftPct: 24 },
    ];
  }, []);

  const blocks = useMemo(() => {
    return [
      { x: 50, y: 90, w: 150, h: 110, br: 24 },
      { x: 210, y: 50, w: 120, h: 160, br: 28 },
      { x: 110, y: 200, w: 190, h: 90, br: 20 },
    ];
  }, []);

  const streetsH = useMemo(() => {
    const rows: { topPct: number }[] = [];
    for (let i = 0; i < 7; i++) rows.push({ topPct: 14 + i * 9 });
    return rows;
  }, []);

  const streetsV = useMemo(() => {
    const cols: { leftPct: number }[] = [];
    for (let i = 0; i < 8; i++) cols.push({ leftPct: 12 + i * 9 });
    return cols;
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.layer, layer1]}>
        <View style={styles.countryWrap}>
          {outlines.map((o) => {
            const topVal = (o.topPct / 100) * SCREEN_HEIGHT;
            const leftVal = (o.leftPct / 100) * SCREEN_WIDTH;
            return (
              <View
                key={o.w}
                style={[
                  styles.countryOutline,
                  {
                    width: o.w,
                    height: o.h,
                    borderRadius: o.br,
                    top: topVal,
                    left: leftVal,
                    borderColor: "rgba(17,17,17,0.07)",
                  },
                ]}
              />
            );
          })}
        </View>
      </Animated.View>

      <Animated.View style={[styles.layer, layer2]}>
        <View style={styles.contourWrap}>
          {Array.from({ length: 16 }).map((_, i) => {
            const size = 120 + i * 32;
            return (
              <View
                key={i}
                style={[
                  styles.contour,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    opacity: 0.45 - i * 0.025,
                  },
                ]}
              />
            );
          })}
        </View>
      </Animated.View>

      <Animated.View style={[styles.layer, layer3]}>
        <View style={styles.blockWrap}>
          {blocks.map((b, idx) => (
            <View
              key={idx}
              style={[
                styles.block,
                {
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  borderRadius: b.br,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.layer, layer4]}>
        <View style={styles.streetWrap}>
          {streetsH.map((s, i) => {
            const topVal = (s.topPct / 100) * SCREEN_HEIGHT;
            return (
              <View
                key={"h" + i}
                style={[
                  styles.streetH,
                  {
                    top: topVal,
                    left: SCREEN_WIDTH * 0.12,
                    right: SCREEN_WIDTH * 0.12,
                  },
                ]}
              />
            );
          })}
          {streetsV.map((s, i) => {
            const leftVal = (s.leftPct / 100) * SCREEN_WIDTH;
            return (
              <View
                key={"v" + i}
                style={[
                  styles.streetV,
                  {
                    left: leftVal,
                    top: SCREEN_HEIGHT * 0.12,
                    bottom: SCREEN_HEIGHT * 0.12,
                  },
                ]}
              />
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#FAFAF8",
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  countryWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  countryOutline: {
    position: "absolute",
    borderWidth: 1.6,
    borderColor: "rgba(17,17,17,0.28)",
    backgroundColor: "transparent",
  },
  contourWrap: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contour: {
    position: "absolute",
    borderWidth: 1.3,
    borderColor: "rgba(17,17,17,0.28)",
    backgroundColor: "transparent",
  },
  blockWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  block: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(17,17,17,0.30)",
    backgroundColor: "transparent",
  },
  streetWrap: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  streetH: {
    position: "absolute",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(17,17,17,0.30)",
  },
  streetV: {
    position: "absolute",
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(17,17,17,0.30)",
  },
});
