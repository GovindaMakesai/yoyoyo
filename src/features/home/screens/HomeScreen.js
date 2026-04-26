import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import socketService from "../../../services/socket";
import { useAuthStore, useRoomStore } from "../../../store";

const HomeScreen = ({ navigation }) => {
  const { user, logout, loading: authLoading } = useAuthStore();
  const { rooms, createRoom, selectRoom } = useRoomStore();

  React.useEffect(() => {
    if (!user) {
      return;
    }

    socketService.connect(user.id);
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const handleOpenRoom = (room) => {
    selectRoom(room);
    navigation.navigate(ROUTES.Room, { roomId: room.id });
  };

  const handleCreateRoom = () => {
    createRoom();
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
      <Text style={styles.roomTitle}>{item.title}</Text>
      <Text style={styles.roomMeta}>{item.participants} listening</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || "Guest"}</Text>
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
        <Text style={styles.createButtonText}>Create Room</Text>
      </TouchableOpacity>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No rooms yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 24,
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
    paddingTop: 16,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 12,
    padding: 14,
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
  disabled: {
    opacity: 0.7,
  },
});

export default HomeScreen;
