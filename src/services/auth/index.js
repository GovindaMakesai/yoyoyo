import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../../utils/constants";
import api from "../api";

export const persistSession = async (session) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, JSON.stringify(session));
};

export const getPersistedSession = async () => {
  const rawSession = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION);

  if (!rawSession) {
    return null;
  }

  return JSON.parse(rawSession);
};

export const clearPersistedSession = async () => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
};

export const registerWithEmail = async ({ name, email, password }) => {
  const response = await api.post("/auth/register", { name, email, password });
  return response.data;
};

export const loginWithEmail = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const requestOtpApi = async ({ channel, identifier }) => {
  const response = await api.post("/auth/otp/request", { channel, identifier });
  return response.data;
};

export const verifyOtpApi = async ({ channel, identifier, code, name }) => {
  const response = await api.post("/auth/otp/verify", { channel, identifier, code, name });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data?.user;
};