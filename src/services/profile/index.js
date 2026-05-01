import api from "../api";

export const updateProfileApi = async ({ name, avatarUrl }) => {
  const response = await api.patch("/profile", { name, avatarUrl });
  return response.data?.user;
};
