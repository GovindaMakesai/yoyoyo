import { create } from "zustand";
import socketService from "../services/socket";

const appendUniqueMessage = (messages = [], message) => {
  if (!message?.id && !message?.clientMessageId) {
    return [...messages, message];
  }
  const hasDuplicate = messages.some(
    (item) =>
      (message.id && item.id === message.id) ||
      (message.clientMessageId && item.clientMessageId === message.clientMessageId)
  );
  if (hasDuplicate) {
    return messages;
  }
  return [...messages, message];
};

export const useChatStore = create((set, get) => ({
  messagesByRoom: {},
  typingByRoom: {},
  loading: false,
  error: "",
  hydrateRoomMessages: (roomId) => {
    const existing = get().messagesByRoom[roomId];
    if (!existing) {
      set((state) => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [],
        },
      }));
    }
  },

  setRoomMessages: (roomId, messages = []) => {
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: messages,
      },
    }));
  },

  sendMessage: async ({ roomId, senderId, senderName, text, type = "text" }) => {
    try {
      if (!text.trim()) {
        return;
      }

      set({ loading: true, error: "" });

      const message = {
        id: `msg_${Date.now()}`,
        clientMessageId: `msg_${Date.now()}`,
        roomId,
        sender: senderName,
        senderId,
        senderName,
        type,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: appendUniqueMessage(state.messagesByRoom[roomId] || [], message),
        },
      }));

      socketService.sendMessage(message);
    } catch (error) {
      set({ error: "Failed to send message." });
    } finally {
      set({ loading: false });
    }
  },

  receiveMessage: (message) => {
    set((state) => {
      const existing = state.messagesByRoom[message.roomId] || [];
      const matchIndex = existing.findIndex(
        (item) =>
          (message.id && item.id === message.id) ||
          (message.clientMessageId && item.clientMessageId === message.clientMessageId)
      );

      if (matchIndex >= 0) {
        const next = [...existing];
        next[matchIndex] = { ...next[matchIndex], ...message, id: message.id || next[matchIndex].id };
        return {
          messagesByRoom: {
            ...state.messagesByRoom,
            [message.roomId]: next,
          },
        };
      }

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [message.roomId]: appendUniqueMessage(existing, message),
        },
      };
    });
  },

  receiveSystemMessage: (message) => {
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [message.roomId]: appendUniqueMessage(state.messagesByRoom[message.roomId] || [], message),
      },
    }));
  },

  setTyping: ({ roomId, userName, isTyping }) => {
    set((state) => {
      const current = state.typingByRoom[roomId] || [];
      const withoutUser = current.filter((item) => item !== userName);
      const nextUsers = isTyping ? [...withoutUser, userName] : withoutUser;

      return {
        typingByRoom: {
          ...state.typingByRoom,
          [roomId]: nextUsers,
        },
      };
    });
  },
}));
