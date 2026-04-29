import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { appColors } from "../../../navigation/theme";
import { useWalletStore } from "../../../store";

const ActivityScreen = () => {
  const { transactions } = useWalletStore();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity</Text>
      {transactions.map((tx) => (
        <View key={tx._id} style={styles.item}>
          <Text style={styles.itemText}>
            {tx.type === "credit" ? "💰" : "🪙"} {tx.reason} ({tx.type} {tx.amount})
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 20,
  },
  title: {
    color: appColors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
  },
  item: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    padding: 14,
    marginBottom: 10,
  },
  itemText: {
    color: appColors.textPrimary,
    fontSize: 14,
  },
});

export default ActivityScreen;
