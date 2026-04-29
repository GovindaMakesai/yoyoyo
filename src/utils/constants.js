const REMOTE_BASE_URL = "https://yoyoyo-ov3j.onrender.com";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || REMOTE_BASE_URL;
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_BASE_URL;

export const STORAGE_KEYS = {
  SESSION: "voice_social_session",
};
