import { create } from "zustand";
import { createRoomApi, fetchRoomMessagesApi, fetchRooms, joinRoomApi, leaveRoomApi } from "../services/rooms";

export const useRoomStore = create((set) => ({
  rooms: [],
  activeRoom: null,
  roomUsersById: {},
  loading: false,
  error: "",

  loadRooms: async () => {
    try {
      set({ loading: true, error: "" });
      const rooms = await fetchRooms();
      set({ rooms });
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to load rooms." });
    } finally {
      set({ loading: false });
    }
  },

  createRoom: async ({ title, maxMembers, lockPassword } = {}) => {
    try {
      set({ loading: true, error: "" });
      const room = await createRoomApi({ title, maxMembers, lockPassword });
      set((state) => ({ rooms: [room, ...state.rooms] }));
      return room;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to create room." });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  selectRoom: (room) => {
    set({ activeRoom: room, error: "" });
  },

  clearActiveRoom: () => {
    set({ activeRoom: null });
  },

  updateRoomUsers: (roomId, users) => {
    set((state) => ({
      roomUsersById: {
        ...state.roomUsersById,
        [roomId]: users || [],
      },
      rooms: state.rooms.map((room) =>
        String(room._id || room.id) === String(roomId)
          ? { ...room, participants: (users || []).length }
          : room
      ),
    }));
  },

  joinRoom: async ({ roomId, password }) => {
    try {
      set({ loading: true, error: "" });
      const room = await joinRoomApi({ roomId, password });
      set({ activeRoom: room });
      return room;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to join room." });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  leaveRoom: async ({ roomId }) => {
    try {
      set({ loading: true, error: "" });
      await leaveRoomApi({ roomId });
      set({ activeRoom: null });
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to leave room." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loadRoomMessages: async (roomId) => {
    try {
      return await fetchRoomMessagesApi({ roomId });
    } catch (_error) {
      return [];
    }
  },
}));
