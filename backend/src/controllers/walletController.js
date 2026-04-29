const mongoose = require("mongoose");
const { User } = require("../models/User");
const { Transaction } = require("../models/Transaction");
const { asyncHandler } = require("../utils/asyncHandler");

const getBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("coins");
  return res.json({ coins: user?.coins || 0 });
});

const mutateBalance = async (userId, amount, type, reason) => {
  const session = await mongoose.startSession();
  let response;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found.");
      }

      if (type === "debit" && user.coins < amount) {
        const err = new Error("Insufficient balance.");
        err.statusCode = 400;
        throw err;
      }

      user.coins = type === "credit" ? user.coins + amount : user.coins - amount;
      await user.save({ session });

      const tx = await Transaction.create(
        [
          {
            userId: user._id,
            type,
            amount,
            reason,
            balanceAfter: user.coins,
          },
        ],
        { session }
      );

      response = { coins: user.coins, transaction: tx[0] };
    });
  } finally {
    await session.endSession();
  }

  return response;
};

const addCoins = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body || {};
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0." });
  }

  const result = await mutateBalance(req.user._id, Math.floor(n), "credit", String(reason || "Top up"));
  return res.json(result);
});

const spendCoins = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body || {};
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0." });
  }

  const result = await mutateBalance(req.user._id, Math.floor(n), "debit", String(reason || "Spend"));
  return res.json(result);
});

const listTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.json({ transactions });
});

module.exports = { getBalance, addCoins, spendCoins, listTransactions };
