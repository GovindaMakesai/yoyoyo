import api from "../api";

export const getBalanceApi = async () => {
  const response = await api.get("/wallet/balance");
  return response.data?.coins ?? 0;
};

export const addCoinsApi = async ({ amount, reason }) => {
  const response = await api.post("/wallet/add", { amount, reason });
  return response.data;
};

export const spendCoinsApi = async ({ amount, reason }) => {
  const response = await api.post("/wallet/spend", { amount, reason });
  return response.data;
};

export const getTransactionsApi = async () => {
  const response = await api.get("/wallet/transactions");
  return response.data?.transactions || [];
};

export const claimDailyRewardApi = async () => {
  const response = await api.post("/wallet/daily-reward/claim");
  return response.data;
};
