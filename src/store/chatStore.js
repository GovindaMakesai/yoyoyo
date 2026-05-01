import { create } from "zustand";
import socketService from "../services/socket";

const appendUniqueMessage = (messages = [], message) => {
  if (!message?.id) {
    return [...messages, message];
  }
  if (messages.some((item) => item.id === message.id)) {
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

  sendMessage: async ({ roomId, sender, text }) => {
    try {
      if (!text.trim()) {
        return;
      }

      set({ loading: true, error: "" });

      const message = {
        id: `msg_${Date.now()}`,
        roomId,
        sender,
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
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [message.roomId]: appendUniqueMessage(state.messagesByRoom[message.roomId] || [], message),
      },
    }));
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
