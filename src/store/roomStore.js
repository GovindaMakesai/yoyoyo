import { create } from "zustand";

const initialRooms = [
  { id: "room_1", title: "Late Night Tech Talk", participants: 12 },
  { id: "room_2", title: "Startup Founders Lounge", participants: 7 },
  { id: "room_3", title: "Music and Chill", participants: 19 },
];

export const useRoomStore = create((set) => ({
  rooms: initialRooms,
  activeRoom: null,
  loading: false,
  error: "",

  createRoom: () => {
    set((state) => {
      const nextRoom = {
        id: `room_${Date.now()}`,
        title: `New Room ${state.rooms.length + 1}`,
        participants: 1,
      };

      return {
        rooms: [nextRoom, ...state.rooms],
      };
    });
  },

  selectRoom: (room) => {
    set({ activeRoom: room, error: "" });
  },

  clearActiveRoom: () => {
    set({ activeRoom: null });
  },
}));
