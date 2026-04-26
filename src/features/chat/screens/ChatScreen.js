import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { appColors } from "../../../navigation/theme";
import socketService from "../../../services/socket";
import { useAuthStore, useChatStore } from "../../../store";

const ChatScreen = ({ route }) => {
  const [input, setInput] = useState("");
  const roomId = route.params?.roomId;
  const { user } = useAuthStore();
  const { messagesByRoom, loading, error, hydrateRoomMessages, sendMessage, receiveMessage } =
    useChatStore();

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    hydrateRoomMessages(roomId);

    const onMessage = (message) => {
      if (message.roomId === roomId) {
        receiveMessage(message);
      }
    };

    socketService.on("messageReceived", onMessage);
    return () => {
      socketService.off("messageReceived", onMessage);
    };
  }, [hydrateRoomMessages, receiveMessage, roomId]);

  const messages = useMemo(() => messagesByRoom[roomId] || [], [messagesByRoom, roomId]);

  const handleSend = async () => {
    await sendMessage({
      roomId,
      sender: user?.name || "You",
      text: input,
    });
    setInput("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor={appColors.textSecondary}
          style={styles.input}
        />
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 16,
  },
  listContent: {
    paddingBottom: 12,
  },
  messageItem: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  sender: {
    color: appColors.primary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "700",
  },
  messageText: {
    color: appColors.textPrimary,
    fontSize: 14,
  },
  errorText: {
    color: appColors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.surface,
    borderRadius: 10,
    color: appColors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: appColors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sendText: {
    color: appColors.textPrimary,
    fontWeight: "700",
  },
});

export default ChatScreen;
