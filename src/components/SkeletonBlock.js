import React from "react";
import { Animated, StyleSheet } from "react-native";
import { colors, radius } from "../design";

const SkeletonBlock = ({ height = 14, width = "100%", style }) => {
  const opacity = React.useRef(new Animated.Value(0.35)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.75, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { height, width, opacity }, style]} />;
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.sm,
  },
});

export default SkeletonBlock;
