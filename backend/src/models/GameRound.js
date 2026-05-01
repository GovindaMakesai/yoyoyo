const mongoose = require("mongoose");

const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guess: { type: Number, required: true, min: 1, max: 10 },
    amount: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const gameRoundSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    status: { type: String, enum: ["open", "closed", "settled"], default: "open", index: true },
    bets: { type: [betSchema], default: [] },
    luckyNumber: { type: Number, min: 1, max: 10 },
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    multiplier: { type: Number, default: 5, min: 1 },
    closedAt: { type: Date },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

const GameRound = mongoose.model("GameRound", gameRoundSchema);
module.exports = { GameRound };
