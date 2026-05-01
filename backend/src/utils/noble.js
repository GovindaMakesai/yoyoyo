const NOBLE_LEVELS = [
  { minSpent: 0, level: 0, title: "Commoner", dailyRewardCoins: 5 },
  { minSpent: 1000, level: 1, title: "Count", dailyRewardCoins: 10 },
  { minSpent: 10000, level: 2, title: "Duke", dailyRewardCoins: 25 },
  { minSpent: 50000, level: 3, title: "King", dailyRewardCoins: 50 },
];

const getNobleForSpent = (coinsSpent) =>
  [...NOBLE_LEVELS].reverse().find((item) => coinsSpent >= item.minSpent) || NOBLE_LEVELS[0];

module.exports = { NOBLE_LEVELS, getNobleForSpent };
