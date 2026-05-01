import api from "../api";

export const fetchVipPlansApi = async () => {
  const response = await api.get("/vip/plans");
  return response.data?.plans || [];
};

export const createVipOrderApi = async ({ planCode }) => {
  const response = await api.post("/vip/order", { planCode });
  return response.data;
};

export const verifyVipPaymentApi = async (payload) => {
  const response = await api.post("/vip/verify", payload);
  return response.data;
};
