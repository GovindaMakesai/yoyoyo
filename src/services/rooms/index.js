import api from "../api";

export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data?.rooms || [];
};

export const createRoomApi = async ({ title }) => {
  const response = await api.post("/rooms", { title });
  return response.data?.room;
};
