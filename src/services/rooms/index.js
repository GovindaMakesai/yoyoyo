import api from "../api";

export const fetchRooms = async () => {
  const response = await api.get("/rooms");
  return response.data?.rooms || [];
};

export const createRoomApi = async ({ title, maxMembers, lockPassword }) => {
  const response = await api.post("/rooms", { title, maxMembers, lockPassword });
  return response.data?.room;
};

export const joinRoomApi = async ({ roomId, password }) => {
  const response = await api.post(`/rooms/${roomId}/join`, { password });
  return response.data?.room;
};

export const leaveRoomApi = async ({ roomId }) => {
  const response = await api.post(`/rooms/${roomId}/leave`);
  return response.data?.room;
};

export const updateRoomSettingsApi = async ({ roomId, payload }) => {
  const response = await api.patch(`/rooms/${roomId}/settings`, payload);
  return response.data?.room;
};

export const fetchRoomMessagesApi = async ({ roomId }) => {
  const response = await api.get(`/rooms/${roomId}/messages`);
  return response.data?.messages || [];
};
