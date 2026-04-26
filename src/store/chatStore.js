import { create } from "zustand";
import socketService from "../services/socket";

export const useChatStore = create((set, get) => ({
  messagesByRoom: {},
  loading: false,
  error: "",

  hydrateRoomMessages: (roomId) => {
    const existing = get().messagesByRoom[roomId];
    if (existing) {
      return;
    }

    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: [
          {
            id: `welcome_${roomId}`,
            roomId,
            sender: "System",
            text: "Welcome to the room chat.",
            createdAt: new Date().toISOString(),
          },
        ],
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
          [roomId]: [...(state.messagesByRoom[roomId] || []), message],
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
        [message.roomId]: [...(state.messagesByRoom[message.roomId] || []), message],
      },
    }));
  },
}));
