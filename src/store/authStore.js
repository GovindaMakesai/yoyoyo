import { create } from "zustand";
import {
  clearPersistedSession,
  getPersistedSession,
  persistSession,
} from "../services/auth";
import { setAuthToken } from "../services/api";

const buildMockUser = (phone) => ({
  id: `user_${Date.now()}`,
  name: "Voice User",
  phone,
  token: `mock_token_${Date.now()}`,
});

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: "",
  hydrated: false,

  hydrateSession: async () => {
    try {
      set({ loading: true, error: "" });
      const savedUser = await getPersistedSession();
      setAuthToken(savedUser?.token ?? null);
      set({ user: savedUser, hydrated: true });
      return savedUser;
    } catch (error) {
      set({ error: "Failed to restore session.", hydrated: true });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  loginWithPhoneMock: async (phone) => {
    try {
      set({ loading: true, error: "" });

      if (!phone || phone.trim().length < 8) {
        throw new Error("Please enter a valid phone number.");
      }

      const user = buildMockUser(phone.trim());
      await persistSession(user);
      setAuthToken(user.token);
      set({ user });
      return true;
    } catch (error) {
      set({ error: error.message || "Login failed." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogleMock: async () => {
    try {
      set({ loading: true, error: "" });
      const user = buildMockUser("+10000000000");
      await persistSession(user);
      setAuthToken(user.token);
      set({ user });
      return true;
    } catch (error) {
      set({ error: "Google login failed." });
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
      set({ user: null });
    } catch (error) {
      set({ error: "Logout failed." });
    } finally {
      set({ loading: false });
    }
  },
}));
