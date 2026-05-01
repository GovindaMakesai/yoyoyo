const mongoose = require("mongoose");
const { User } = require("../models/User");
const { Transaction } = require("../models/Transaction");
const { getNobleForSpent } = require("../utils/noble");

const mutateBalance = async ({ userId, amount, type, category, reason, metadata = {}, session: externalSession }) => {
  const ownSession = !externalSession;
  const session = externalSession || (await mongoose.startSession());
  let result;

  const txRunner = async () => {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found.");
    if (type === "debit" && user.coins < amount) {
      const err = new Error("Insufficient balance.");
      err.statusCode = 400;
      throw err;
    }

    user.coins = type === "credit" ? user.coins + amount : user.coins - amount;
    if (type === "debit") {
      const totalSpent = (user.noble?.totalCoinsSpent || 0) + amount;
      const noble = getNobleForSpent(totalSpent);
      user.noble = { level: noble.level, title: noble.title, totalCoinsSpent: totalSpent };
    }
    await user.save({ session });

    const tx = await Transaction.create(
      [{ userId: user._id, type, amount, category, reason, balanceAfter: user.coins, metadata }],
      { session }
    );

    result = { user, transaction: tx[0] };
  };

  try {
    if (ownSession) {
      await session.withTransaction(txRunner);
    } else {
      await txRunner();
    }
  } finally {
    if (ownSession) await session.endSession();
  }

  return result;
};

module.exports = { mutateBalance };
