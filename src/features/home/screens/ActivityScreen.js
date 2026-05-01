import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { appColors } from "../../../navigation/theme";
import { useWalletStore } from "../../../store";

const ActivityScreen = () => {
  const { transactions, loadWallet, error } = useWalletStore();

  React.useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <Text style={styles.title}>Activity</Text>
      {transactions.map((tx) => (
        <View key={tx._id} style={styles.item}>
          <Text style={styles.itemText}>
            {tx.type === "credit" ? "💰" : "🪙"} {tx.reason} ({tx.type} {tx.amount})
          </Text>
        </View>
      ))}
      {transactions.length === 0 ? <Text style={styles.itemText}>No coin activity yet.</Text> : null}
      {error ? <Text style={[styles.itemText, { color: appColors.danger }]}>{error}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  contentWrap: {
    padding: 20,
    paddingBottom: 28,
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
