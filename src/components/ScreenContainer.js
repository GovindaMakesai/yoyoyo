import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { colors } from "../design";

const ScreenContainer = ({ children, padded = true, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, padded ? styles.padded : null, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});

export default ScreenContainer;
