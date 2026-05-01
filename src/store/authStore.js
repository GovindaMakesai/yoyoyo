import { create } from "zustand";
import {
  clearPersistedSession,
  getCurrentUser,
  getPersistedSession,
  loginWithEmail,
  persistSession,
  requestOtpApi,
  registerWithEmail,
  verifyOtpApi,
} from "../services/auth";
import { setAuthToken } from "../services/api";
import socketService from "../services/socket";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: "",
  hydrated: false,

  hydrateSession: async () => {
    try {
      set({ loading: true, error: "" });
      const session = await getPersistedSession();
      const token = session?.token || null;
      if (!token) {
        set({ user: null, token: null, hydrated: true });
        return null;
      }

      setAuthToken(token);
      const user = await getCurrentUser();
      socketService.connect({ token, user });
      const nextSession = { token, user };
      await persistSession(nextSession);
      set({ user, token, hydrated: true });
      return user;
    } catch (error) {
      setAuthToken(null);
      await clearPersistedSession();
      set({ user: null, token: null, error: "Failed to restore session.", hydrated: true });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    try {
      set({ loading: true, error: "" });
      const { token, user } = await registerWithEmail(payload);
      setAuthToken(token);
      socketService.connect({ token, user });
      await persistSession({ token, user });
      set({ user, token });
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Registration failed." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async (payload) => {
    try {
      set({ loading: true, error: "" });
      const { token, user } = await loginWithEmail(payload);
      setAuthToken(token);
      socketService.connect({ token, user });
      await persistSession({ token, user });
      set({ user, token });
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Login failed." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  requestOtp: async ({ channel, identifier }) => {
    try {
      set({ loading: true, error: "" });
      return await requestOtpApi({ channel, identifier });
    } catch (error) {
      set({ error: error?.response?.data?.message || "OTP request failed." });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async ({ channel, identifier, code, name }) => {
    try {
      set({ loading: true, error: "" });
      const { token, user } = await verifyOtpApi({ channel, identifier, code, name });
      setAuthToken(token);
      socketService.connect({ token, user });
      await persistSession({ token, user });
      set({ user, token });
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "OTP verification failed." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: "" });
      await clearPersistedSession();
      setAuthToken(null);
      socketService.disconnect();
      set({ user: null, token: null });
    } catch (error) {
      set({ error: "Logout failed." });
    } finally {
      set({ loading: false });
    }
  },
}));
