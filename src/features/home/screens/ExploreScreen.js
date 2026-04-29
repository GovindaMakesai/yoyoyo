import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { appColors } from "../../../navigation/theme";
import { useRoomStore } from "../../../store";

const ExploreScreen = () => {
  const { rooms } = useRoomStore();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Find trending topics and active communities.</Text>
      {rooms.map((room) => (
        <Pressable key={room._id || room.id} style={styles.card}>
          <Text style={styles.cardTitle}>{room.title}</Text>
          <Text style={styles.cardMeta}>{room.participants || 0} listening now</Text>
        </Pressable>
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
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: appColors.textSecondary,
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    color: appColors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  cardMeta: {
    color: appColors.textSecondary,
    marginTop: 5,
    fontSize: 13,
  },
});

export default ExploreScreen;
