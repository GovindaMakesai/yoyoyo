import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadows } from "../design";

const AppCard = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    padding: 14,
    ...shadows.soft,
  },
});

export default AppCard;
