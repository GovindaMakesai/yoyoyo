import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appColors } from "../../../navigation/theme";
import { useToast } from "../../../components";
import socketService from "../../../services/socket";
import { useAuthStore, useChatStore, useRoomStore, useWalletStore } from "../../../store";

const ChatScreen = ({ route }) => {
  const [input, setInput] = useState("");
  const insets = useSafeAreaInsets();
  const roomId = route.params?.roomId;
  const { user } = useAuthStore();
  const { coins, spendCoins, loadWallet } = useWalletStore();
  const { showToast } = useToast();
  const { loadRoomMessages } = useRoomStore();
  const {
    messagesByRoom,
    typingByRoom,
    loading,
    error,
    hydrateRoomMessages,
    sendMessage,
    receiveMessage,
    receiveSystemMessage,
    setRoomMessages,
    setTyping,
  } = useChatStore();

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    hydrateRoomMessages(roomId);
    loadRoomMessages(roomId).then((history) => {
      if (history?.length) {
        setRoomMessages(roomId, history);
      }
    });

    const onMessage = (message) => {
      if (message.roomId === roomId) {
        receiveMessage(message);
      }
    };
    const onSystemMessage = (message) => {
      if (message.roomId === roomId) {
        receiveSystemMessage(message);
      }
    };
    const onTypingUpdated = (payload) => {
      if (payload.roomId === roomId) {
        setTyping(payload);
      }
    };

    socketService.on("messageReceived", onMessage);
    socketService.on("systemMessage", onSystemMessage);
    socketService.on("typingUpdated", onTypingUpdated);
    return () => {
      socketService.off("messageReceived", onMessage);
      socketService.off("systemMessage", onSystemMessage);
      socketService.off("typingUpdated", onTypingUpdated);
    };
  }, [hydrateRoomMessages, loadRoomMessages, receiveMessage, receiveSystemMessage, roomId, setRoomMessages, setTyping]);

  const messages = useMemo(() => messagesByRoom[roomId] || [], [messagesByRoom, roomId]);
  const typingUsers = useMemo(() => typingByRoom[roomId] || [], [typingByRoom, roomId]);
  const giftOptions = useMemo(
    () => [
      { id: "rose", label: "🌹 Rose", cost: 10 },
      { id: "crown", label: "👑 Crown", cost: 50 },
      { id: "rocket", label: "🚀 Rocket", cost: 100 },
    ],
    []
  );

  React.useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    await sendMessage({
      roomId,
      senderId: user?.id || "unknown_user",
      senderName: user?.name || "You",
      text: input,
    });
    socketService.emitTyping({
      roomId,
      userName: user?.name || "You",
      isTyping: false,
    });
    setInput("");
  };

  const handleSendGift = async (gift) => {
    const success = await spendCoins(gift.cost, `Gift sent: ${gift.label}`);
    if (!success) {
      showToast("Not enough coins.", "error");
      return;
    }
    await sendMessage({
      roomId,
      senderId: user?.id || "unknown_user",
      senderName: user?.name || "You",
      text: `sent ${gift.label} (${gift.cost} coins)`,
      type: "gift",
    });
    showToast(`Gift sent: ${gift.label}`, "success");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) + 8 }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 20}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.id || "msg"}_${item.createdAt || index}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 10) + 48 }]}
        renderItem={({ item, index }) => {
          const prevItem = messages[index - 1];
          const senderName = item.sender || item.senderName || "User";
          const isGrouped = (prevItem?.sender || prevItem?.senderName) === senderName;
          const isMine = String(item.senderId || item.sender) === String(user?.id || user?.name);
          return (
            <View
              style={[
                styles.messageItem,
                isGrouped ? styles.messageItemGrouped : null,
                isMine ? styles.messageMine : styles.messageOther,
              ]}
            >
              {!isGrouped ? <Text style={styles.sender}>{senderName}</Text> : null}
              {item.type === "gift" ? <Text style={styles.giftTag}>Gift</Text> : null}
              {item.imageUrl ? <Text style={styles.messageText}>📷 {item.imageUrl}</Text> : null}
              {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
              <Text style={styles.timestamp}>
                {new Date(item.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Start the conversation.</Text>}
      />

      {typingUsers.length > 0 ? (
        <Text style={styles.typingText}>
          {typingUsers.slice(0, 2).join(", ")}
          {typingUsers.length > 2 ? " and others" : ""} typing...
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.giftRow}>
        <Text style={styles.giftCoins}>🪙 {coins}</Text>
        {giftOptions.map((gift) => (
          <Pressable key={gift.id} style={styles.giftButton} onPress={() => handleSendGift(gift)} disabled={loading}>
            <Text style={styles.giftButtonText}>{gift.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.inputRow, { marginBottom: Math.max(insets.bottom, 10) + 8 }]}>
        <TextInput
          value={input}
          onChangeText={(value) => {
            setInput(value);
            socketService.emitTyping({
              roomId,
              userName: user?.name || "You",
              isTyping: Boolean(value.trim()),
            });
          }}
          placeholder="Type a message"
          placeholderTextColor={appColors.textSecondary}
          style={styles.input}
        />
        <Pressable
          style={[styles.sendButton, !input.trim() ? styles.sendDisabled : null]}
          onPress={handleSend}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 10,
  },
  messageItem: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: "85%",
  },
  messageItemGrouped: {
    marginTop: -3,
  },
  messageMine: {
    alignSelf: "flex-end",
    backgroundColor: "#CCFBF1",
  },
  messageOther: {
    alignSelf: "flex-start",
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
    lineHeight: 20,
  },
  timestamp: {
    color: appColors.textSecondary,
    marginTop: 6,
    fontSize: 11,
  },
  emptyText: {
    color: appColors.textSecondary,
    textAlign: "center",
    marginTop: 22,
    fontSize: 13,
  },
  typingText: {
    color: appColors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  errorText: {
    color: appColors.danger,
    fontSize: 12,
    marginBottom: 8,
  },
  giftRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  giftCoins: {
    color: appColors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
  },
  giftButton: {
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  giftButtonText: {
    color: appColors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  giftTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
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
    borderRadius: 12,
    color: appColors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sendDisabled: {
    opacity: 0.55,
  },
});

export default ChatScreen;
