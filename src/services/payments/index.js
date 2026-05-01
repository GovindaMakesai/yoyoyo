import api from "../api";

export const getCoinPacksApi = async () => {
  const response = await api.get("/payments/coin-packs");
  return response.data?.packs || [];
};

export const createCoinOrderApi = async ({ packCode }) => {
  const response = await api.post("/payments/coin-order", { packCode });
  return response.data;
};

export const verifyCoinPaymentApi = async (payload) => {
  const response = await api.post("/payments/coin-verify", payload);
  return response.data;
};
