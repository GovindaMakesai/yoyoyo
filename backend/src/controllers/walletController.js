const { User } = require("../models/User");
const { Transaction } = require("../models/Transaction");
const { asyncHandler } = require("../utils/asyncHandler");
const { mutateBalance } = require("../services/walletService");
const { getNobleForSpent } = require("../utils/noble");

const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("coins");
  return res.json({ coins: user?.coins || 0 });
});

const addCoins = asyncHandler(async (req, res) => {
  const { amount, reason, category = "admin_adjustment" } = req.body || {};
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0." });
  }

  const { user, transaction } = await mutateBalance({
    userId: req.user._id,
    amount: Math.floor(n),
    type: "credit",
    category,
    reason: String(reason || "Top up"),
  });
  return res.json({ coins: user.coins, transaction });
});

const spendCoins = asyncHandler(async (req, res) => {
  const { amount, reason, category = "gift", metadata = {} } = req.body || {};
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0." });
  }

  const { user, transaction } = await mutateBalance({
    userId: req.user._id,
    amount: Math.floor(n),
    type: "debit",
    category,
    reason: String(reason || "Spend"),
    metadata,
  });
  return res.json({ coins: user.coins, transaction, noble: user.noble });
});

const claimDailyReward = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const now = new Date();
  const lastClaim = user.dailyReward?.lastClaimAt ? new Date(user.dailyReward.lastClaimAt) : null;
  const alreadyClaimedToday = lastClaim && lastClaim.toDateString() === now.toDateString();
  if (alreadyClaimedToday) {
    return res.status(400).json({ message: "Daily reward already claimed." });
  }

  const prevDay = new Date(now);
  prevDay.setDate(now.getDate() - 1);
  const streak = lastClaim && lastClaim.toDateString() === prevDay.toDateString() ? (user.dailyReward?.streak || 0) + 1 : 1;
  user.dailyReward = { streak, lastClaimAt: now };
  await user.save();

  const nobleTier = getNobleForSpent(user.noble?.totalCoinsSpent || 0);
  const baseReward = 20;
  const streakBonus = Math.min(streak * 2, 20);
  const rewardAmount = baseReward + streakBonus + nobleTier.dailyRewardCoins;

  const { user: updatedUser, transaction } = await mutateBalance({
    userId: user._id,
    amount: rewardAmount,
    type: "credit",
    category: "daily_reward",
    reason: `Daily reward day ${streak}`,
    metadata: { streak, nobleLevel: nobleTier.level },
  });
  return res.json({ coins: updatedUser.coins, rewardAmount, streak, transaction });
});

const listTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.json({ transactions, noble: req.user.noble, vip: req.user.vip });
});

module.exports = { getBalance, addCoins, spendCoins, claimDailyReward, listTransactions };
