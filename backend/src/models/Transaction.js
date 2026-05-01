const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      enum: ["daily_reward", "purchase", "game_bet", "game_reward", "gift", "admin_adjustment", "subscription"],
      required: true,
    },
    reason: { type: String, required: true, trim: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = { Transaction };
