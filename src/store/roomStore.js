import { create } from "zustand";
import { createRoomApi, fetchRooms } from "../services/rooms";

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

  createRoom: async (title) => {
    try {
      set({ loading: true, error: "" });
      const room = await createRoomApi({ title });
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
}));
