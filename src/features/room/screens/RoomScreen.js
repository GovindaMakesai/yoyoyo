import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ROUTES } from "../../../navigation/routes";
import { appColors } from "../../../navigation/theme";
import socketService from "../../../services/socket";
import { useAuthStore, useRoomStore } from "../../../store";

const RoomScreen = ({ navigation, route }) => {
  const [micOn, setMicOn] = useState(true);
  const { user } = useAuthStore();
  const { rooms, activeRoom, clearActiveRoom } = useRoomStore();
  const roomId = route.params?.roomId;

  const room = useMemo(
    () => activeRoom || rooms.find((item) => item.id === roomId) || null,
    [activeRoom, roomId, rooms]
  );

  const users = useMemo(
    () => [
      { id: "host_1", name: "Host" },
      { id: "speaker_1", name: "Speaker" },
      { id: user?.id || "you", name: user?.name || "You" },
    ],
    [user]
  );

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    socketService.joinRoom(roomId);
    return () => {
      socketService.leaveRoom(roomId);
    };
  }, [roomId]);

  const handleLeave = () => {
    if (roomId) {
      socketService.leaveRoom(roomId);
    }
    clearActiveRoom();
    navigation.goBack();
  };

  const handleOpenChat = () => {
    navigation.navigate(ROUTES.Chat, { roomId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomTitle}>{room?.title || "Room"}</Text>
      <Text style={styles.sectionLabel}>Listeners & Speakers</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <Pressable
          style={[styles.micButton, !micOn ? styles.micOff : null]}
          onPress={() => setMicOn((prev) => !prev)}
        >
          <Text style={styles.buttonText}>{micOn ? "Mic On" : "Mic Off"}</Text>
        </Pressable>

        <Pressable style={styles.chatButton} onPress={handleOpenChat}>
          <Text style={styles.buttonText}>Open Chat</Text>
        </Pressable>

        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.buttonText}>Leave Room</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 24,
  },
  roomTitle: {
    color: appColors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 10,
    color: appColors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 12,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    marginBottom: 8,
  },
  userName: {
    color: appColors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
  },
  micButton: {
    backgroundColor: appColors.success,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10,
  },
  micOff: {
    backgroundColor: appColors.border,
  },
  chatButton: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10,
  },
  leaveButton: {
    backgroundColor: appColors.danger,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },
  buttonText: {
    color: appColors.textPrimary,
    fontWeight: "700",
  },
});

export default RoomScreen;
