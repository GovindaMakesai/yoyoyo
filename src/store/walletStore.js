import { create } from "zustand";
import { addCoinsApi, getBalanceApi, getTransactionsApi, spendCoinsApi } from "../services/wallet";

export const useWalletStore = create((set) => ({
  coins: 0,
  transactions: [],
  loading: false,
  error: "",

  loadWallet: async () => {
    try {
      set({ loading: true, error: "" });
      const [coins, transactions] = await Promise.all([getBalanceApi(), getTransactionsApi()]);
      set({ coins, transactions });
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to load wallet." });
    } finally {
      set({ loading: false });
    }
  },

  addCoins: async (amount, reason = "Top up") => {
    try {
      set({ loading: true, error: "" });
      const result = await addCoinsApi({ amount, reason });
      set((state) => ({ coins: result.coins, transactions: [result.transaction, ...state.transactions] }));
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to add coins." });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  spendCoins: async (amount, reason = "Spend") => {
    try {
      set({ loading: true, error: "" });
      const result = await spendCoinsApi({ amount, reason });
      set((state) => ({ coins: result.coins, transactions: [result.transaction, ...state.transactions] }));
      return true;
    } catch (error) {
      set({ error: error?.response?.data?.message || "Failed to spend coins." });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
