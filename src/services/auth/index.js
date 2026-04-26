import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../../utils/constants";

export const persistSession = async (user) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, JSON.stringify(user));
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