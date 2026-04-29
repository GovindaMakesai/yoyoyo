import React from "react";
import {
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import { useAuthStore, useRoomStore, useWalletStore } from "../../../store";

const HomeScreen = ({ navigation }) => {
  const { user, logout, loading: authLoading } = useAuthStore();
  const { rooms, createRoom, selectRoom, loadRooms, loading: roomLoading, error } = useRoomStore();
  const { coins, loadWallet } = useWalletStore();

  React.useEffect(() => {
    if (user) {
      loadRooms();
      loadWallet();
    }
  }, [user, loadRooms, loadWallet]);

  const handleOpenRoom = (room) => {
    selectRoom(room);
    navigation.navigate(ROUTES.Room, { roomId: room._id || room.id });
  };

  const handleCreateRoom = async () => {
    const newRoom = await createRoom(`Room by ${user?.name || "Host"}`);
    if (newRoom) {
      handleOpenRoom(newRoom);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.Login }],
    });
  };

  const renderRoom = ({ item }) => (
    <Pressable style={styles.roomCard} onPress={() => handleOpenRoom(item)}>
      <View style={styles.roomTopRow}>
        <Text style={styles.roomEmoji}>🎙️</Text>
        <Text style={styles.roomTitle}>{item.title}</Text>
      </View>
      <Text style={styles.roomMeta}>{item.participants} listening</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Voice Rooms</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || "Guest"} 👋</Text>
          <Text style={styles.subtitle}>Coins: {coins}</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, authLoading ? styles.disabled : null]}
          onPress={handleLogout}
          disabled={authLoading}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
        <Text style={styles.createButtonText}>{roomLoading ? "Creating..." : "Create Room"}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Live Rooms</Text>
      <View style={styles.listContent}>
        {error ? <Text style={styles.emptyText}>{error}</Text> : null}
        {rooms.length === 0 ? <Text style={styles.emptyText}>No rooms yet.</Text> : null}
        {rooms.map((room) => (
          <View key={room._id || room.id}>{renderRoom({ item: room })}</View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  contentWrap: {
    padding: 24,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: appColors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 10,
    color: appColors.textSecondary,
    fontSize: 14,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: appColors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 18,
    backgroundColor: appColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createButtonText: {
    color: appColors.textPrimary,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 12,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  roomTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomEmoji: {
    marginRight: 8,
    fontSize: 15,
  },
  roomTitle: {
    color: appColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  roomMeta: {
    marginTop: 4,
    color: appColors.textSecondary,
    fontSize: 13,
  },
  emptyText: {
    color: appColors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  sectionTitle: {
    color: appColors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.7,
  },
});

export default HomeScreen;
