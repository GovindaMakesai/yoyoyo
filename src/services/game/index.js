import api from "../api";

export const openLuckyRoundApi = async ({ roomId }) => {
  const response = await api.post(`/games/${roomId}/lucky-rounds`);
  return response.data?.round;
};

export const placeLuckyBetApi = async ({ roomId, roundId, guess, amount }) => {
  const response = await api.post(`/games/${roomId}/lucky-rounds/${roundId}/bets`, { guess, amount });
  return response.data?.round;
};

export const settleLuckyRoundApi = async ({ roomId, roundId, luckyNumber }) => {
  const response = await api.post(`/games/${roomId}/lucky-rounds/${roundId}/settle`, { luckyNumber });
  return response.data;
};
