import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../design";

const AppButton = ({ label, onPress, disabled, variant = "primary", leftSlot, style }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
      <Text style={[styles.label, variant === "secondary" ? styles.labelSecondary : styles.labelOnBrand]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  label: {
    fontWeight: "700",
    fontSize: 14,
  },
  labelOnBrand: {
    color: "#FFFFFF",
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
  leftSlot: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
});

export default AppButton;
